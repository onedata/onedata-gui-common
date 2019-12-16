import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe(
  'Integration | Component | form component/form fields collection group',
  function () {
    setupComponentTest('form-component/form-fields-collection-group', {
      integration: true,
    });

    it('renders "add field" button', function () {
      sinon.stub(lookupService(this, 'i18n'), 't')
        .withArgs('abc.addButtonText')
        .returns('add');
      this.set('collectionGroup', FormFieldsCollectionGroup.create({
        ownerSource: this,
        name: 'abc',
      }));

      this.render(hbs `
        {{form-component/form-fields-collection-group field=collectionGroup}}
      `);

      const $button = this.$('.add-field-button');
      expect($button).to.exist;
      expect($button.find('.one-icon')).to.have.class('oneicon-add-filled');
      expect($button.text().trim()).to.equal('add');
    });

    it('allows to add new field', function () {
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod(createdFieldsCounter) {
          return TextField.create({
            name: 'textField',
            valueName: `textField${createdFieldsCounter}`,
          });
        },
      }).create({ ownerSource: this });
      this.set('collectionGroup', collectionGroup);

      this.render(hbs `
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

    it('allows to remove field', function () {
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod() {
          return TextField.create({
            name: 'textField',
            valueName: `textField${this.get('fields.length')}`,
          });
        },
      }).create({ ownerSource: this });
      this.set('collectionGroup', collectionGroup);

      this.render(hbs `
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
  }
);
