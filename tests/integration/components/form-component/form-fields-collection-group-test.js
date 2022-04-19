import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import EmberObject, { set } from '@ember/object';

describe(
  'Integration | Component | form component/form fields collection group',
  function () {
    setupRenderingTest();

    it('renders "add field" button', async function () {
      sinon.stub(lookupService(this, 'i18n'), 't')
        .withArgs('abc.addButtonText')
        .returns('add');
      this.set('collectionGroup', FormFieldsCollectionGroup.create({
        ownerSource: this.owner,
        name: 'abc',
      }));

      await render(hbs `
        {{form-component/form-fields-collection-group field=collectionGroup}}
      `);

      const button = find('.add-field-button');
      expect(button).to.exist;
      expect(button.querySelector('.one-icon')).to.have.class('oneicon-add-filled');
      expect(button.textContent.trim()).to.equal('add');
    });

    it('allows to add new field', async function () {
      const valuesSource = EmberObject.create({
        collection: EmberObject.create(),
      });
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod(createdFieldsCounter) {
          return TextField.create({
            name: 'textField',
            valueName: `textField${createdFieldsCounter}`,
          });
        },
      }).create({
        name: 'collection',
        ownerSource: this.owner,
        parent: {
          isEffectivelyEnabled: true,
          onValueChange(value) {
            set(valuesSource, 'collection', value);
          },
        },
        valuesSource,
      });
      this.set('collectionGroup', collectionGroup);

      await render(hbs `
        {{form-component/form-fields-collection-group field=collectionGroup}}
      `);

      await click('.add-field-button');
      await click('.add-field-button');

      const textFields = findAll('.text-like-field-renderer');
      expect(textFields).to.have.length(2);
      expect(textFields[0]).to.have.class('textField-field');
      expect(textFields[1]).to.have.class('textField-field');
    });

    it('allows to remove field', async function () {
      const valuesSource = EmberObject.create({
        collection: EmberObject.create(),
      });
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod() {
          return TextField.create({
            name: 'textField',
            valueName: `textField${this.get('fields.length')}`,
          });
        },
      }).create({
        name: 'collection',
        ownerSource: this.owner,
        parent: {
          isEffectivelyEnabled: true,
          onValueChange(value) {
            set(valuesSource, 'collection', value);
          },
        },
        valuesSource,
      });
      this.set('collectionGroup', collectionGroup);

      await render(hbs `
        {{form-component/form-fields-collection-group field=collectionGroup}}
      `);

      await click('.add-field-button');
      await click('.add-field-button');
      const textFields = findAll('.text-like-field-renderer');
      await click('.collection-item:first-child .remove-field-button');

      const newTextFields = findAll('.text-like-field-renderer');
      expect(newTextFields).to.have.length(1);
      expect(newTextFields[0]).to.equal(textFields[1]);
    });

    it('blocks creating and removing fields in "view" mode', async function () {
      const valuesSource = EmberObject.create({
        collection: EmberObject.create(),
      });
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod() {
          return TextField.create({
            name: 'textField',
            valueName: `textField${this.get('fields.length')}`,
          });
        },
      }).create({
        name: 'collection',
        ownerSource: this.owner,
        parent: {
          isEffectivelyEnabled: true,
          onValueChange(value) {
            set(valuesSource, 'collection', value);
          },
        },
        valuesSource,
      });
      this.set('collectionGroup', collectionGroup);

      await render(hbs `
        {{form-component/form-fields-collection-group field=collectionGroup}}
      `);

      await click('.add-field-button');
      collectionGroup.changeMode('view');
      await settled();

      expect(find('.remove-field-button')).to.not.exist;
      expect(find('.add-field-button')).to.not.exist;
    });

    it('can be disabled', async function () {
      const valuesSource = EmberObject.create({
        collection: EmberObject.create(),
      });
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod() {
          return TextField.create({
            name: 'textField',
            valueName: `textField${this.get('fields.length')}`,
          });
        },
      }).create({
        name: 'collection',
        ownerSource: this.owner,
        parent: {
          isEffectivelyEnabled: true,
          onValueChange(value) {
            set(valuesSource, 'collection', value);
          },
        },
        valuesSource,
      });
      this.set('collectionGroup', collectionGroup);
      await render(hbs `
        {{form-component/form-fields-collection-group field=collectionGroup}}
      `);

      await click('.add-field-button');
      this.set('collectionGroup.isEnabled', false);
      await settled();

      expect(find('.add-field-button').disabled).to.be.true;
      expect(find('.remove-icon')).to.have.class('disabled');
    });

    it('hides add and remove buttons when "isCollectionManipulationAllowed" is false',
      async function () {
        const valuesSource = EmberObject.create({
          collection: EmberObject.create(),
        });
        const collectionGroup = FormFieldsCollectionGroup.extend({
          fieldFactoryMethod() {
            return TextField.create({
              name: 'textField',
              valueName: `textField${this.get('fields.length')}`,
            });
          },
        }).create({
          name: 'collection',
          ownerSource: this.owner,
          parent: {
            isEffectivelyEnabled: true,
            onValueChange(value) {
              set(valuesSource, 'collection', value);
            },
          },
          valuesSource,
        });
        this.set('collectionGroup', collectionGroup);

        await render(hbs `
          {{form-component/form-fields-collection-group field=collectionGroup}}
        `);

        await click('.add-field-button');
        set(collectionGroup, 'isCollectionManipulationAllowed', false);
        await settled();

        expect(find('.remove-field-button')).to.not.exist;
        expect(find('.add-field-button')).to.not.exist;
      });
  }
);
