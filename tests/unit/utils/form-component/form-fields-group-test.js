import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { A } from '@ember/array';
import EmberObject, { get, getProperties } from '@ember/object';

describe('Unit | Utility | form component/form fields group', function () {
  it('sets child fields parent when passing fields on creation', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([FormField.create()]),
    });

    expect(get(get(formGroup, 'fields').objectAt(0), 'parent')).to.equal(formGroup);
  });

  it('sets child fields parent when modifying fields collection', function () {
    const formGroup = FormFieldsGroup.create();
    get(formGroup, 'fields').pushObject(FormField.create());

    expect(get(get(formGroup, 'fields').objectAt(0), 'parent')).to.equal(formGroup);
  });

  it('represents lack of modified fields through falsy isModified', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });

    expect(get(formGroup, 'isModified')).to.be.false;
  });

  it('represents existence of modified fields through truthy isModified', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });
    get(formGroup, 'fields').objectAt(0).markAsModified();

    expect(get(formGroup, 'isModified')).to.be.true;
  });

  it('sets all fields isModified to false on calling markAsNotModified()', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });
    get(formGroup, 'fields').invoke('markAsModified');

    formGroup.markAsNotModified();

    expect(get(formGroup, 'isModified')).to.be.false;
    expect(get(formGroup, 'fields').isAny('isModified')).to.be.false;
  });

  it('sets all fields isModified to true on calling markAsModified()', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });

    formGroup.markAsModified();

    expect(get(formGroup, 'isModified')).to.be.true;
    expect(get(formGroup, 'fields').isEvery('isModified')).to.be.true;
  });

  it(
    'represents mode of fields through mode property (every field has the same)',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'show',
          }),
          FormField.create({
            mode: 'show',
          }),
        ]),
      });

      expect(get(formGroup, 'mode')).to.equal('show');
    }
  );

  it(
    'represents mode of fields through mode property (fields have different mode)',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'show',
          }),
          FormField.create({
            mode: 'edit',
          }),
        ]),
      });

      expect(get(formGroup, 'mode')).to.equal('mixed');
    }
  );

  it('sets all fields mode on calling changeMode()', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create({
          mode: 'show',
        }),
        FormField.create({
          mode: 'edit',
        }),
      ]),
    });

    formGroup.changeMode('show');

    expect(get(formGroup, 'mode')).to.equal('show');
    expect(get(formGroup, 'fields').isEvery('mode', 'show')).to.be.true;
  });

  it('represents lack of enabled fields through falsy isEnabled', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create({
          isEnabled: false,
        }),
        FormField.create({
          isEnabled: false,
        }),
      ]),
    });

    expect(get(formGroup, 'isEnabled')).to.be.false;
  });

  it(
    'represents existence of some enabled fields through truthy isEnabled',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isEnabled: true,
          }),
          FormField.create({
            isEnabled: false,
          }),
        ]),
      });

      expect(get(formGroup, 'isEnabled')).to.be.true;
    }
  );

  it('disables all fields on disable()', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create({
          isEnabled: true,
        }),
        FormField.create({
          isEnabled: true,
        }),
      ]),
    });

    formGroup.disable();

    expect(get(formGroup, 'isEnabled')).to.be.false;
    expect(get(formGroup, 'fields').isEvery('isEnabled', false)).to.be.true;
  });

  it('enables all fields on enable()', function () {
    const formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create({
          isEnabled: false,
        }),
        FormField.create({
          isEnabled: false,
        }),
      ]),
    });

    formGroup.enable();

    expect(get(formGroup, 'isEnabled')).to.be.true;
    expect(get(formGroup, 'fields').isEvery('isEnabled')).to.be.true;
  });

  it(
    'represents negative validation results of fields through falsy isValid',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: false,
          }),
          FormField.create({
            isValid: true,
          }),
        ]),
      });

      expect(get(formGroup, 'isValid')).to.be.false;
    }
  );

  it(
    'represents positive validation results of fields through truthy isValid',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: true,
          }),
          FormField.create({
            isValid: true,
          }),
        ]),
      });

      expect(get(formGroup, 'isValid')).to.be.true;
    }
  );

  it(
    'has empty "invalidFields" when fields are valid',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: true,
          }),
          FormField.create({
            isValid: true,
          }),
        ]),
      });

      expect(get(formGroup, 'invalidFields')).to.have.length(0);
    }
  );

  it(
    'has filled in "invalidFields" when fields are invalid',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: false,
          }),
          FormField.create({
            isValid: false,
          }),
        ]),
      });

      const {
        fields,
        invalidFields,
      } = getProperties(formGroup, 'fields', 'invalidFields');
      expect(invalidFields).to.have.length(2);
      expect(invalidFields[0]).to.equal(fields[0]);
      expect(invalidFields[1]).to.equal(fields[1]);
    }
  );

  it(
    'does not put disabled invalid fields into "invalidFields"',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: false,
            isEnabled: false,
          }),
          FormField.create({
            isValid: false,
          }),
        ]),
      });

      const {
        fields,
        invalidFields,
      } = getProperties(formGroup, 'fields', 'invalidFields');
      expect(invalidFields).to.have.length(1);
      expect(invalidFields[0]).to.equal(fields[1]);
    }
  );

  it(
    'returns aggregated fields default values as a dumpDefaultValues() result',
    function () {
      const formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
            defaultValue: '1',
          }),
        ]),
      });

      const defaultValue = formGroup.dumpDefaultValue();
      expect(defaultValue).to.not.have.property('a');
      expect(defaultValue).to.include({ b: '1' });
    }
  );

  it(
    'has truthy "isExpanded" by default',
    function () {
      const formGroup = FormFieldsGroup.create();

      expect(get(formGroup, 'isExpanded')).to.be.true;
    }
  );

  it(
    'returns aggregated fields values as a dumpValues() result',
    function () {
      const formGroup = FormFieldsGroup.create({
        valuesSource: EmberObject.create({
          a: 1,
          b: 2,
        }),
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
          }),
        ]),
      });

      const value = formGroup.dumpValue();
      expect(value).to.include({
        a: 1,
        b: 2,
      });
    }
  );
});
