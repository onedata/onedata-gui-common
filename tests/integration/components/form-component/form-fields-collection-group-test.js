import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
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

      const $button = this.$('.add-field-button');
      expect($button).to.exist;
      expect($button.find('.one-icon')).to.have.class('oneicon-add-filled');
      expect($button.text().trim()).to.equal('add');
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

      return click('.add-field-button')
        .then(() => click('.add-field-button'))
        .then(() => {
          const $textFields = this.$('.text-like-field-renderer');
          expect($textFields).to.have.length(2);
          expect($textFields.eq(0)).to.have.class('textField-field');
          expect($textFields.eq(1)).to.have.class('textField-field');
        });
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

      let $textFields;
      return click('.add-field-button')
        .then(() => click('.add-field-button'))
        .then(() => $textFields = this.$('.text-like-field-renderer'))
        .then(() => click('.collection-item:first-child .remove-field-button'))
        .then(() => {
          const $newTextFields = this.$('.text-like-field-renderer');
          expect($newTextFields).to.have.length(1);
          expect($newTextFields[0]).to.equal($textFields[1]);
        });
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

      return click('.add-field-button')
        .then(() => {
          collectionGroup.changeMode('view');
          return wait();
        })
        .then(() => {
          expect(this.$('.remove-field-button')).to.not.exist;
          expect(this.$('.add-field-button')).to.not.exist;
        });
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
      await wait();

      expect(this.$('.add-field-button')).to.have.attr('disabled');
      expect(this.$('.remove-icon')).to.have.class('disabled');
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
        await wait();

        expect(this.$('.remove-field-button')).to.not.exist;
        expect(this.$('.add-field-button')).to.not.exist;
      });
  }
);
