import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { get } from '@ember/object';

describe('Unit | Utility | form component/form fields root group', function () {
  [
    'path',
    'valuePath',
  ].forEach(fieldName => {
    it(
      `has empty ${fieldName}`,
      function () {
        const formFieldsRootGroup = FormFieldsRootGroup.create();

        expect(get(formFieldsRootGroup, fieldName)).to.be.empty;
      }
    );
  });

  it(
    'sets default values for fields on reset()',
    function () {
      const field1 = FormField.create({
        name: 'field1',
        defaultValue: 'f1',
      });
      const field2 = FormField.create({
        name: 'field2',
        defaultValue: 'f2',
      });
      const formFieldsRootGroup = FormFieldsRootGroup.create({
        fields: [
          field1,
          FormFieldsGroup.create({
            name: 'group1',
            fields: [field2],
          }),
        ],
      });

      formFieldsRootGroup.reset();

      expect(get(field1, 'value')).to.equal('f1');
      expect(get(field2, 'value')).to.equal('f2');
      expect(get(formFieldsRootGroup, 'valuesSource.field1')).to.equal('f1');
      expect(get(formFieldsRootGroup, 'valuesSource.group1.field2')).to.equal('f2');
    }
  );

  it(
    'persists (in valuesSource) changed value from nested field and marks it as modified',
    function () {
      const field = FormField.create({ name: 'field1' });
      const formFieldsRootGroup = FormFieldsRootGroup.create({
        fields: [
          FormFieldsGroup.create({
            name: 'group1',
            fields: [field],
          }),
        ],
      });

      field.valueChanged('test');

      expect(get(field, 'value')).to.equal('test');
      expect(get(field, 'isModified')).to.be.true;
      expect(get(formFieldsRootGroup, 'valuesSource.group1.field1')).to.equal('test');
    }
  );

  it(
    'changes nested field state to modified on focus lost',
    function () {
      const field = FormField.create({ name: 'field1' });
      FormFieldsRootGroup.create({
        fields: [
          FormFieldsGroup.create({
            name: 'group1',
            fields: [field],
          }),
        ],
      });

      field.focusLost();

      expect(get(field, 'isModified')).to.be.true;
    }
  );
});
