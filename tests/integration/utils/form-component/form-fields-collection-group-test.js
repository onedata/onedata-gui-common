import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { A } from '@ember/array';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import { get, set } from '@ember/object';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';

describe(
  'Integration | Utility | form-component/form-fields-collection-group',
  function () {
    const { afterEach } = setupTest();

    afterEach(function () {
      this.collectionGroup.destroy();
    });

    it('has "isCollectionManipulationAllowed" set to true by default', function () {
      this.collectionGroup = FormFieldsCollectionGroup.create();

      expect(get(this.collectionGroup, 'isCollectionManipulationAllowed')).to.be.true;
    });

    it(
      'adds field through addNewField() (with usage of fieldFactoryMethod())',
      function () {
        const valuesSource = createValuesContainer({
          collection: createValuesContainer(),
        });
        const changeSpy = sinon.spy(value => set(valuesSource, 'collection', value));
        this.collectionGroup = FormFieldsCollectionGroup.extend({
          fieldFactoryMethod(newFieldValueName) {
            return FormField.create({
              name: 'f',
              valueName: newFieldValueName,
              defaultValue: newFieldValueName,
            });
          },
        }).create({
          name: 'collection',
          parent: {
            onValueChange: changeSpy,
          },
          valuesSource,
        });

        this.collectionGroup.addNewField();
        this.collectionGroup.addNewField();
        expect(get(this.collectionGroup, 'fields')).to.have.length(2);
        expect(get(this.collectionGroup, 'fields.firstObject.valueName'))
          .to.equal('collectionEntry0');
        expect(get(this.collectionGroup, 'fields.lastObject.valueName'))
          .to.equal('collectionEntry1');
        expect(changeSpy.lastCall).to.be.calledWith(
          sinon.match({
            collectionEntry0: 'collectionEntry0',
            collectionEntry1: 'collectionEntry1',
            __fieldsValueNames: ['collectionEntry0', 'collectionEntry1'],
          })
        );
      }
    );

    it(
      'removes specified field through removeField()',
      function () {
        const changeSpy = sinon.spy(value => set(valuesSource, 'collection', value));
        const valuesSource = createValuesContainer({
          collection: createValuesContainer({
            collectionEntry0: 'val0',
            __fieldsValueNames: ['collectionEntry0'],
          }),
        });
        this.collectionGroup = FormFieldsCollectionGroup.extend({
          fieldFactoryMethod(newFieldValueName) {
            return FormField.create({
              name: 'f',
              valueName: newFieldValueName,
              defaultValue: 1,
            });
          },
        }).create({
          name: 'collection',
          parent: {
            onValueChange: changeSpy,
          },
          valuesSource,
        });

        expect(get(this.collectionGroup, 'fields.length')).to.equal(1);

        this.collectionGroup.removeField(get(this.collectionGroup, 'fields.firstObject'));
        expect(changeSpy.lastCall.args[0]).to.not.have.nested.property('collectionEntry0');
        expect(get(this.collectionGroup, 'fields')).to.have.length(0);
        expect(get(changeSpy.lastCall.args[0], '__fieldsValueNames')).to.have.length(0);
      }
    );

    it(
      'automatically adds fields when value is mentioning them',
      function () {
        const valuesSource = createValuesContainer({
          collection: createValuesContainer({
            collectionEntry0: 'val0',
            collectionEntry1: 'val1',
            __fieldsValueNames: ['collectionEntry0', 'collectionEntry1'],
          }),
        });
        const changeSpy = sinon.spy(value => set(valuesSource, 'collection', value));
        this.collectionGroup = FormFieldsCollectionGroup.extend({
          fieldFactoryMethod(newFieldValueName) {
            return FormField.create({
              name: 'f',
              valueName: newFieldValueName,
              defaultValue: 'default',
            });
          },
        }).create({
          name: 'collection',
          parent: {
            onValueChange: changeSpy,
          },
          valuesSource,
        });

        expect(get(this.collectionGroup, 'fields')).to.have.length(2);
        const firstField = get(this.collectionGroup, 'fields.firstObject');
        const secondField = get(this.collectionGroup, 'fields.lastObject');
        expect(get(firstField, 'valueName')).to.equal('collectionEntry0');
        expect(get(secondField, 'valueName')).to.equal('collectionEntry1');
        expect(get(firstField, 'value')).to.equal('val0');
        expect(get(secondField, 'value')).to.equal('val1');
        expect(changeSpy).to.not.be.called;
      }
    );

    it(
      'automatically removes fields when value is not mentioning them',
      function () {
        const valuesSource = createValuesContainer({
          collection: createValuesContainer({
            collectionEntry0: 'val0',
            __fieldsValueNames: ['collectionEntry0'],
          }),
        });
        const changeSpy = sinon.spy((value => set(valuesSource, 'collection', value)));
        this.collectionGroup = FormFieldsCollectionGroup.extend({
          fieldFactoryMethod(newFieldValueName) {
            return FormField.create({
              name: 'f',
              valueName: newFieldValueName,
              defaultValue: 'default',
            });
          },
        }).create({
          fields: A([
            FormField.create({
              name: 'f',
              valueName: 'collectionEntry0',
            }),
            FormField.create({
              name: 'f',
              valueName: 'collectionEntry1',
            }),
          ]),
          name: 'collection',
          parent: {
            onValueChange: changeSpy,
          },
          valuesSource,
        });

        expect(get(this.collectionGroup, 'fields')).to.have.length(1);
        const field = get(this.collectionGroup, 'fields.firstObject');
        expect(get(field, 'valueName')).to.equal('collectionEntry0');
        expect(get(field, 'value')).to.equal('val0');
        expect(changeSpy).to.not.be.called;
      }
    );

    it(
      'provides default translation for "addButtonText"',
      function () {
        this.collectionGroup = FormFieldsCollectionGroup.create({
          ownerSource: this.owner,
          name: 'abc',
        });

        expect(String(get(this.collectionGroup, 'addButtonText'))).to.equal('Add');
      }
    );

    it(
      'provides specific translation for "addButtonText" if exists',
      function () {
        sinon.stub(lookupService(this, 'i18n'), 't')
          .withArgs('abc.addButtonText')
          .returns('specificText');

        this.collectionGroup = FormFieldsCollectionGroup.create({
          ownerSource: this.owner,
          name: 'abc',
        });

        expect(get(this.collectionGroup, 'addButtonText')).to.equal('specificText');
      }
    );

    it('provides default empty translation for "emptyCollectionViewModeText"',
      function () {
        this.collectionGroup = FormFieldsCollectionGroup.create({
          ownerSource: this.owner,
          name: 'abc',
        });

        expect(String(get(this.collectionGroup, 'emptyCollectionViewModeText')))
          .to.equal('');
      }
    );

    it('provides specific translation for "emptyCollectionViewModeText" if exists',
      function () {
        sinon.stub(lookupService(this, 'i18n'), 't')
          .withArgs('abc.emptyCollectionViewModeText')
          .returns('specificText');

        this.collectionGroup = FormFieldsCollectionGroup.create({
          ownerSource: this.owner,
          name: 'abc',
        });

        expect(get(this.collectionGroup, 'emptyCollectionViewModeText'))
          .to.equal('specificText');
      }
    );
  }
);
