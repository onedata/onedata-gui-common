import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { A } from '@ember/array';
import EmberObject, { get, set } from '@ember/object';
import sinon from 'sinon';
import { setupComponentTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';

describe(
  'Integration | Utility | form component/form fields collection group',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    it(
      'represents fields value names in collection through __fieldsValueNames in group value',
      function () {
        const collectionGroup = FormFieldsCollectionGroup.create({
          fields: A([
            FormField.create({
              name: 'f',
              valueName: 'f0',
            }),
            FormField.create({
              name: 'f',
              valueName: 'f1',
            }),
          ]),
        });
        const defaultValue = collectionGroup.dumpDefaultValue();

        expect(get(defaultValue, '__fieldsValueNames')).to.deep.equal(['f0', 'f1']);
      }
    );

    it(
      'represents fields value names in collection through __fieldsValueNames in group value without valueless fields',
      function () {
        const collectionGroup = FormFieldsCollectionGroup.create({
          fields: A([
            FormField.create({
              name: 'f',
              valueName: 'f0',
            }),
            FormField.create({
              name: 'f',
              valueName: 'f1',
              isValueless: true,
            }),
          ]),
        });
        const defaultValue = collectionGroup.dumpDefaultValue();

        expect(get(defaultValue, '__fieldsValueNames')).to.deep.equal(['f0']);
      }
    );

    it(
      'adds field through addNewField() (with usage of fieldFactoryMethod())',
      function () {
        const valuesSource = EmberObject.create({
          collection: EmberObject.create(),
        });
        const changeSpy = sinon.spy(value => set(valuesSource, 'collection', value));
        const collectionGroup = FormFieldsCollectionGroup.extend({
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

        collectionGroup.addNewField();
        collectionGroup.addNewField();
        expect(get(collectionGroup, 'fields')).to.have.length(2);
        expect(get(collectionGroup, 'fields.firstObject.valueName'))
          .to.equal('collectionEntry0');
        expect(get(collectionGroup, 'fields.lastObject.valueName'))
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
        const changeSpy = sinon.spy();
        const collectionGroup = FormFieldsCollectionGroup.create({
          fields: A([
            FormField.create({
              name: 'f',
              valueName: 'f0',
              defaultValue: 1,
            }),
          ]),
          parent: {
            onValueChange: changeSpy,
          },
        });

        set(collectionGroup, 'value', collectionGroup.dumpDefaultValue());
        expect(get(collectionGroup, 'value.f0')).to.equal(1);

        collectionGroup.removeField(get(collectionGroup, 'fields.firstObject'));
        expect(changeSpy.lastCall.args[0]).to.not.have.nested.property('value.f0');
        expect(get(collectionGroup, 'fields')).to.have.length(0);
        expect(get(changeSpy.lastCall.args[0], '__fieldsValueNames')).to.have.length(0);
      }
    );

    it(
      'automatically adds fields when value is mentioning them',
      function () {
        const valuesSource = EmberObject.create({
          collection: EmberObject.create({
            collectionEntry0: 'val0',
            collectionEntry1: 'val1',
            __fieldsValueNames: ['collectionEntry0', 'collectionEntry1'],
          }),
        });
        const changeSpy = sinon.spy();
        const collectionGroup = FormFieldsCollectionGroup.extend({
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

        expect(get(collectionGroup, 'fields')).to.have.length(2);
        const firstField = get(collectionGroup, 'fields.firstObject');
        const secondField = get(collectionGroup, 'fields.lastObject');
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
        const valuesSource = EmberObject.create({
          collection: EmberObject.create({
            collectionEntry0: 'val0',
            __fieldsValueNames: ['collectionEntry0'],
          }),
        });
        const changeSpy = sinon.spy();
        const collectionGroup = FormFieldsCollectionGroup.extend({
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

        expect(get(collectionGroup, 'fields')).to.have.length(1);
        const field = get(collectionGroup, 'fields.firstObject');
        expect(get(field, 'valueName')).to.equal('collectionEntry0');
        expect(get(field, 'value')).to.equal('val0');
        expect(changeSpy).to.not.be.called;
      }
    );

    it(
      'provides default translation for "addButtonText"',
      function () {
        const collectionGroup = FormFieldsCollectionGroup.create({
          ownerSource: this,
          name: 'abc',
        });

        expect(get(collectionGroup, 'addButtonText')).to.equal('Add');
      }
    );

    it(
      'provides specific translation for "addButtonText" if exists',
      function () {
        sinon.stub(lookupService(this, 'i18n'), 't')
          .withArgs('abc.addButtonText')
          .returns('specificText');

        const collectionGroup = FormFieldsCollectionGroup.create({
          ownerSource: this,
          name: 'abc',
        });

        expect(get(collectionGroup, 'addButtonText')).to.equal('specificText');
      }
    );
  }
);
