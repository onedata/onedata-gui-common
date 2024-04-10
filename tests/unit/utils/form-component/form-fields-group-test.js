import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { A } from '@ember/array';
import { get, getProperties } from '@ember/object';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

describe('Unit | Utility | form-component/form-fields-group', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.formGroup.destroy();
  });

  it('sets child fields parent when passing fields on creation', function () {
    this.formGroup = FormFieldsGroup.create({
      fields: A([FormField.create()]),
    });

    expect(get(get(this.formGroup, 'fields').objectAt(0), 'parent')).to.equal(this.formGroup);
  });

  it('sets child fields parent when modifying fields collection', function () {
    this.formGroup = FormFieldsGroup.create();
    get(this.formGroup, 'fields').pushObject(FormField.create());

    expect(get(get(this.formGroup, 'fields').objectAt(0), 'parent')).to.equal(this.formGroup);
  });

  it('represents lack of modified fields through falsy isModified', function () {
    this.formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });

    expect(get(this.formGroup, 'isModified')).to.be.false;
  });

  it('represents existence of modified fields through truthy isModified', function () {
    this.formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });
    get(this.formGroup, 'fields').objectAt(0).markAsModified();

    expect(get(this.formGroup, 'isModified')).to.be.true;
  });

  it('sets all fields isModified to false on calling markAsNotModified()', function () {
    this.formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });
    get(this.formGroup, 'fields').invoke('markAsModified');

    this.formGroup.markAsNotModified();

    expect(get(this.formGroup, 'isModified')).to.be.false;
    expect(get(this.formGroup, 'fields').isAny('isModified')).to.be.false;
  });

  it('sets all fields isModified to true on calling markAsModified()', function () {
    this.formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create(),
        FormField.create(),
      ]),
    });

    this.formGroup.markAsModified();

    expect(get(this.formGroup, 'isModified')).to.be.true;
    expect(get(this.formGroup, 'fields').isEvery('isModified')).to.be.true;
  });

  it(
    'represents mode of fields through mode property (every field has the same)',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'show',
          }),
          FormField.create({
            mode: 'show',
          }),
        ]),
      });

      expect(get(this.formGroup, 'mode')).to.equal('show');
    }
  );

  it(
    'represents mode of fields through mode property (fields have different mode)',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'show',
          }),
          FormField.create({
            mode: 'edit',
          }),
        ]),
      });

      expect(get(this.formGroup, 'mode')).to.equal('mixed');
    }
  );

  it('sets all fields mode on calling changeMode()', function () {
    this.formGroup = FormFieldsGroup.create({
      fields: A([
        FormField.create({
          mode: 'show',
        }),
        FormField.create({
          mode: 'edit',
        }),
      ]),
    });

    this.formGroup.changeMode('show');

    expect(get(this.formGroup, 'mode')).to.equal('show');
    expect(get(this.formGroup, 'fields').isEvery('mode', 'show')).to.be.true;
  });

  it(
    'fallbacks mode to "edit" when all fields were in mode "edit" and then removed',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'edit',
          }),
          FormField.create({
            mode: 'edit',
          }),
        ]),
      });

      this.formGroup.fields.forEach((field) => field.destroy());
      this.formGroup.fields.clear();
      expect(get(this.formGroup, 'mode')).to.equal('edit');
    }
  );

  it(
    'fallbacks mode to "edit" when all fields were in mixed "view" and "edit" modes and then removed',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'edit',
          }),
          FormField.create({
            mode: 'view',
          }),
        ]),
      });

      this.formGroup.fields.forEach((field) => field.destroy());
      this.formGroup.fields.clear();
      expect(get(this.formGroup, 'mode')).to.equal('edit');
    }
  );

  it(
    'fallbacks mode to "view" when all fields were in "view" mode and then removed',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            mode: 'edit',
          }),
          FormField.create({
            mode: 'view',
          }),
        ]),
      });

      this.formGroup.fields.forEach((field) => field.destroy());
      this.formGroup.fields.clear();
      expect(get(this.formGroup, 'mode')).to.equal('edit');
    }
  );

  it(
    'fallbacks mode to "edit" when all fields were in "mixed" mode and then removed',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormFieldsGroup.create({
            fields: [
              FormField.create({
                mode: 'edit',
              }),
              FormField.create({
                mode: 'view',
              }),
            ],
          }),
          FormFieldsGroup.create({
            fields: [
              FormField.create({
                mode: 'edit',
              }),
              FormField.create({
                mode: 'view',
              }),
            ],
          }),
        ]),
      });

      this.formGroup.fields.forEach((field) => field.destroy());
      this.formGroup.fields.clear();
      expect(get(this.formGroup, 'mode')).to.equal('edit');
    }
  );

  it(
    'has mode "edit" by default',
    function () {
      this.formGroup = FormFieldsGroup.create();

      expect(get(this.formGroup, 'mode')).to.equal('edit');
    }
  );

  [
    'edit',
    'view',
  ].forEach(mode => {
    it(
      `can change mode to "${mode}" even when there are no fields`,
      function () {
        this.formGroup = FormFieldsGroup.create();
        this.formGroup.changeMode(mode);

        expect(get(this.formGroup, 'mode')).to.equal(mode);
      }
    );
  });

  it(
    'represents negative validation results of fields through falsy isValid',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: false,
          }),
          FormField.create({
            isValid: true,
          }),
        ]),
      });

      expect(get(this.formGroup, 'isValid')).to.be.false;
    }
  );

  it(
    'represents positive validation results of fields through truthy isValid',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: true,
          }),
          FormField.create({
            isValid: true,
          }),
        ]),
      });

      expect(get(this.formGroup, 'isValid')).to.be.true;
    }
  );

  it(
    'has empty "invalidFields" when fields are valid',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            isValid: true,
          }),
          FormField.create({
            isValid: true,
          }),
        ]),
      });

      expect(get(this.formGroup, 'invalidFields')).to.have.length(0);
    }
  );

  it(
    'has filled in "invalidFields" when fields are invalid',
    function () {
      this.formGroup = FormFieldsGroup.create({
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
      } = getProperties(this.formGroup, 'fields', 'invalidFields');
      expect(invalidFields).to.have.length(2);
      expect(invalidFields[0]).to.equal(fields[0]);
      expect(invalidFields[1]).to.equal(fields[1]);
    }
  );

  it(
    'does not put disabled invalid fields into "invalidFields"',
    function () {
      this.formGroup = FormFieldsGroup.create({
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
      } = getProperties(this.formGroup, 'fields', 'invalidFields');
      expect(invalidFields).to.have.length(1);
      expect(invalidFields[0]).to.equal(fields[1]);
    }
  );

  it(
    'returns aggregated fields default values as a dumpDefaultValues() result',
    function () {
      this.formGroup = FormFieldsGroup.create({
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

      const defaultValue = this.formGroup.dumpDefaultValue();
      expect(defaultValue).to.not.have.property('a');
      expect(defaultValue).to.include({ b: '1' });
    }
  );

  it(
    'returns aggregated fields default values as a dumpDefaultValues() result ignoring valueless fields',
    function () {
      this.formGroup = FormFieldsGroup.create({
        fields: A([
          FormField.create({
            name: 'a',
            defaultValue: '0',
          }),
          FormField.create({
            name: 'b',
            defaultValue: '1',
            isValueless: true,
          }),
        ]),
      });

      const defaultValue = this.formGroup.dumpDefaultValue();
      expect(defaultValue).to.not.have.property('b');
      expect(defaultValue).to.include({ a: '0' });
    }
  );

  it(
    'returns aggregated fields values as a dumpValues() result',
    function () {
      this.formGroup = FormFieldsGroup.create({
        valuesSource: createValuesContainer({
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

      const value = this.formGroup.dumpValue();
      expect(value).to.include({
        a: 1,
        b: 2,
      });
    }
  );

  it(
    'returns aggregated fields values as a dumpValues() result ignoring valueless fields',
    function () {
      this.formGroup = FormFieldsGroup.create({
        valuesSource: createValuesContainer({
          a: 1,
          b: 2,
        }),
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
            isValueless: true,
          }),
        ]),
      });

      const value = this.formGroup.dumpValue();
      expect(value).to.not.have.property('b');
      expect(value).to.include({ a: 1 });
    }
  );

  it(
    'returns nested field from getFieldByPath() when searching by existing path',
    function () {
      const field = FormField.create({
        name: 'f',
      });
      this.formGroup = FormFieldsGroup.create({
        name: 'g0',
        fields: A([
          FormFieldsGroup.create({
            name: 'g1',
            fields: [field],
          }),
        ]),
      });

      expect(this.formGroup.getFieldByPath('g1.f')).to.equal(field);
    },
  );

  it(
    'returns null from getFieldByPath() when searching by non-existing path',
    function () {
      const field = FormField.create({
        name: 'f',
      });
      this.formGroup = FormFieldsGroup.create({
        name: 'g0',
        fields: A([
          FormFieldsGroup.create({
            name: 'g1',
            fields: [field],
          }),
        ]),
      });

      expect(this.formGroup.getFieldByPath('g1.g')).to.be.null;
    },
  );

  it('dumps groups own default value when "isDefaultValueIgnored" is false and it has specified default value',
    function () {
      this.formGroup = FormFieldsGroup.create({
        defaultValue: createValuesContainer({
          a: 1,
          b: 2,
        }),
        isDefaultValueIgnored: false,
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
            defaultValue: 1,
          }),
        ]),
      });

      const defaultValue = this.formGroup.dumpDefaultValue();
      expect(get(defaultValue, 'a')).to.equal(1);
      expect(get(defaultValue, 'b')).to.equal(2);
    });

  it('dumps nested fields default values when "isDefaultValueIgnored" is false and it has not specified default value',
    function () {
      this.formGroup = FormFieldsGroup.create({
        isDefaultValueIgnored: false,
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
            defaultValue: 1,
          }),
        ]),
      });

      const defaultValue = this.formGroup.dumpDefaultValue();
      expect(get(defaultValue, 'a')).to.equal(undefined);
      expect(get(defaultValue, 'b')).to.equal(1);
    });

  it('calls "useCurrentValueAsDefault" on all nested fields after "useCurrentValueAsDefault" call and group has truthy "isDefaultValueIgnored"',
    function () {
      this.formGroup = FormFieldsGroup.create({
        valuesSource: createValuesContainer({
          a: 1,
          b: 2,
        }),
        isDefaultValueIgnored: true,
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
            defaultValue: 1,
          }),
        ]),
      });

      this.formGroup.useCurrentValueAsDefault();

      expect(get(this.formGroup, 'fields.0').dumpDefaultValue()).to.equal(1);
      expect(get(this.formGroup, 'fields.1').dumpDefaultValue()).to.equal(2);
    });

  it('sets default value of group as a whole on "useCurrentValueAsDefault" call when group has falsey "isDefaultValueIgnored"',
    function () {
      this.formGroup = FormFieldsGroup.create({
        valuesSource: createValuesContainer({
          a: 1,
          b: 2,
        }),
        isDefaultValueIgnored: false,
        fields: A([
          FormField.create({
            name: 'a',
          }),
          FormField.create({
            name: 'b',
            defaultValue: 1,
          }),
        ]),
      });

      this.formGroup.useCurrentValueAsDefault();

      expect(get(this.formGroup, 'fields.0').dumpDefaultValue()).to.equal(undefined);
      expect(get(this.formGroup, 'fields.1').dumpDefaultValue()).to.equal(1);
      const defaultValue = this.formGroup.dumpDefaultValue();
      expect(get(defaultValue, 'a')).to.equal(1);
      expect(get(defaultValue, 'b')).to.equal(2);
    });
});
