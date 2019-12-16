import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { A } from '@ember/array';
import { get, set } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | form component/form fields collection group', function () {
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
    'adds field through addNewField() (with usage of fieldFactoryMethod())',
    function () {
      const changeSpy = sinon.spy();
      const collectionGroup = FormFieldsCollectionGroup.extend({
        fieldFactoryMethod(index) {
          return FormField.create({
            name: 'f',
            valueName: `f${index}`,
          });
        },
      }).create({
        parent: {
          onValueChange: changeSpy,
        },
        fields: A([
          FormField.create({
            name: 'f',
            valueName: 'f0',
          }),
        ]),
      });

      collectionGroup.addNewField();
      const newField = get(collectionGroup, 'fields.lastObject');
      expect(get(collectionGroup, 'fields')).to.have.length(2);
      expect(get(newField, 'valueName')).to.equal('f1');
      expect(changeSpy.lastCall).to.be.calledWith(
        sinon.match.has('__fieldsValueNames', ['f0', 'f1'])
      );
    }
  );

  it(
    'removes specified field through removeField()',
    function () {
      const changeSpy = sinon.spy();
      const collectionGroup = FormFieldsCollectionGroup.create({
        parent: {
          onValueChange: changeSpy,
        },
        fields: A([
          FormField.create({
            name: 'f',
            valueName: 'f0',
            defaultValue: 1,
          }),
        ]),
      });

      set(collectionGroup, 'value', collectionGroup.dumpDefaultValue());
      expect(get(collectionGroup, 'value.f0')).to.equal(1);

      collectionGroup.removeField(get(collectionGroup, 'fields.firstObject'));
      expect(changeSpy.lastCall.args[0]).to.not.have.nested.property('value.f0');
      expect(get(collectionGroup, 'fields')).to.have.length(0);
      expect(get(changeSpy.lastCall.args[0], '__fieldsValueNames')).to.have.length(0);
    }
  );
});
