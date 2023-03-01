import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  find,
  findAll,
  fillIn,
  render,
  click,
  focus,
  blur,
  settled,
} from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  AtmParameterSpecsEditor,
  rawValueToAtmParameterSpecsEditorValue,
  atmParameterSpecsEditorValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/atm-lambda';
import OneDrodopdownHelper from '../../../../helpers/one-dropdown';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

describe('Integration | Utility | atm-workflow/atm-lambda/atm-parameter-specs-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      rootGroup: FormFieldsRootGroup.create({
        ownerSource: this.owner,
        fields: [
          AtmParameterSpecsEditor.create({
            name: 'atmParameterSpecsEditor',
          }),
        ],
      }),
      helper: new Helper(this),
    });
  });

  it('has no parameters defined on init', async function () {
    await this.helper.render();

    expect(this.helper.getParameters()).to.have.length(0);
    expect(this.helper.getAddParameterBtn()).to.exist
      .and.to.not.have.attr('disabled');
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal([]);
  });

  it('allows to add new, empty parameter', async function () {
    await this.helper.render();

    await this.helper.addParameter();

    const parameters = this.helper.getParameters();
    expect(parameters).to.have.length(1);

    const nameField = this.helper.getField('entryName');
    expect(nameField).to.have.attr('type', 'text');
    expect(nameField).to.have.attr('placeholder', 'Name');
    expect(nameField).to.have.value('');

    expect(this.helper.getField('entryDataSpec'))
      .to.have.trimmed.text('Select type...');

    expect(this.helper.getFieldLabel('entryIsOptional'))
      .to.have.trimmed.text('Optional');
    expect(this.helper.getField('entryIsOptional'))
      .to.not.have.class('checked');

    expect(this.helper.getFieldLabel('entryDefaultValue'))
      .to.have.trimmed.text('Default value:');
    expect(this.helper.getField('entryDefaultValue'))
      .to.contain('.create-value-btn');

    expect(this.helper.isValid()).to.be.false;
  });

  it('allows to fill in empty parameter data', async function () {
    await this.helper.render();

    const expectedValue = await this.helper.setupSingleNumberParameter();

    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal(expectedValue);
  });

  it('marks "name" field as invalid when it is empty',
    async function () {
      await this.helper.render();
      await this.helper.addParameter();

      await focus(this.helper.getField('entryName'));
      await blur(this.helper.getField('entryName'));

      expect(this.helper.getFormGroup('entryName')).to.have.class('has-error');
    }
  );

  it('marks "name" field as valid when it is not empty',
    async function () {
      await this.helper.render();
      await this.helper.addParameter();

      await fillIn(this.helper.getField('entryName'), 'somename');

      expect(this.helper.getFormGroup('entryName')).to.have.class('has-success');
    }
  );

  it('marks "name" field as invalid when there are two arguments with the same name',
    async function () {
      await this.helper.render();
      await this.helper.addParameter();
      await this.helper.addParameter();
      await this.helper.addParameter();

      await fillIn(this.helper.getField('entryName', 0), 'somename');
      await fillIn(this.helper.getField('entryName', 1), 'somename');
      await fillIn(this.helper.getField('entryName', 2), 'othername');

      [0, 1].forEach((i) => {
        expect(this.helper.getFormGroup('entryName', i)).to.have.class('has-error');
        expect(this.helper.getFormGroup('entryName', i).querySelector('.field-message'))
          .to.have.trimmed.text('This field must have a unique value');
      });
      expect(this.helper.getFormGroup('entryName', 2)).to.have.class('has-success');
    }
  );

  it('marks form as invalid when data spec is not defined correctly',
    async function () {
      await this.helper.render();

      await this.helper.setupSingleNumberParameter();
      await click(
        this.helper.getField('entryDataSpec').querySelector('.remove-trigger')
      );

      expect(this.helper.isValid()).to.be.false;
    }
  );

  it('marks form as invalid when default value is not defined correctly',
    async function () {
      await this.helper.render();

      await this.helper.setupSingleNumberParameter();
      await fillIn(
        this.helper.getField('entryDefaultValue').querySelector('input'),
        ''
      );

      expect(this.helper.isValid()).to.be.false;
    }
  );

  it('resets default value when data spec changes', async function () {
    await this.helper.render();

    const expectedValue = await this.helper.setupSingleNumberParameter();
    await click(
      this.helper.getField('entryDataSpec').querySelector('.pack-into-array')
    );

    expect(this.helper.getField('entryDefaultValue')).to.contain('.array-editor')
      .and.to.not.contain('.number-editor');
    expect(this.helper.isValid()).to.be.true;
    expectedValue[0].dataSpec = {
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: expectedValue[0].dataSpec,
      },
    };
    expectedValue[0].defaultValue = [];
    expect(this.helper.getValue()).to.deep.equal(expectedValue);
  });

  it('resets default value to no value when data spec changes to an incorrect one',
    async function () {
      await this.helper.render();

      const expectedValue = await this.helper.setupSingleNumberParameter();
      await click(
        this.helper.getField('entryDataSpec').querySelector('.remove-trigger')
      );

      expect(this.helper.getField('entryDefaultValue'))
        .to.contain('.create-value-btn');
      expect(this.helper.isValid()).to.be.false;
      expectedValue[0].dataSpec = null;
      expectedValue[0].defaultValue = null;
      expect(this.helper.getValue()).to.deep.equal(expectedValue);
    }
  );

  it('shows passed value', async function () {
    await this.helper.render();

    await this.helper.setValue([{
      name: 'somename',
      dataSpec: {
        type: AtmDataSpecType.Number,
        valueConstraints: {},
      },
      isOptional: true,
      defaultValue: 10,
    }]);

    expect(this.helper.getField('entryName')).have.value('somename');
    expect(this.helper.getField('entryDataSpec')).have.contain.text('Number');
    expect(this.helper.getField('entryIsOptional')).have.have.class('checked');
    expect(
      this.helper.getField('entryDefaultValue').querySelector('.number-editor input')
    ).have.have.value('10');
  });
});

class Helper {
  constructor(testCase) {
    this.testCase = testCase;
  }

  async render() {
    await render(hbs`{{form-component/field-renderer field=rootGroup}}`);
  }

  getParameters() {
    return findAll('.entry-field');
  }

  async addParameter() {
    await click(this.getAddParameterBtn());
  }

  getAddParameterBtn() {
    return find('.add-field-button');
  }

  getFormGroup(name, entryIdx = 0) {
    const parameter = this.getParameters()[entryIdx];
    return parameter?.querySelector(`.${name}-field`);
  }

  getField(name, entryIdx = 0) {
    let fieldSelector = '.form-control';
    switch (name) {
      case 'entryDataSpec':
        fieldSelector = '.data-spec-editor';
        break;
      case 'entryDefaultValue':
        fieldSelector = '.value-editor';
        break;
    }

    return this.getFormGroup(name, entryIdx)?.querySelector(fieldSelector);
  }

  getFieldLabel(name, entryIdx = 0) {
    return this.getFormGroup(name, entryIdx)?.querySelector('.control-label');
  }

  isValid() {
    return this.testCase.rootGroup.isValid;
  }

  getValue() {
    return atmParameterSpecsEditorValueToRawValue(
      this.testCase.rootGroup.dumpValue().atmParameterSpecsEditor
    );
  }

  async setValue(value) {
    this.testCase.set(
      'rootGroup.valuesSource.atmParameterSpecsEditor',
      rawValueToAtmParameterSpecsEditorValue(value)
    );
    await settled();
  }

  async setupSingleNumberParameter() {
    await this.addParameter();
    const dataSpecDropdown =
      new OneDrodopdownHelper(this.getField('entryDataSpec'));

    await fillIn(this.getField('entryName'), 'somename');
    await dataSpecDropdown.selectOptionByText('Number');
    await click(this.getField('entryIsOptional'));
    await click(
      this.getField('entryDefaultValue').querySelector('.create-value-btn')
    );
    await fillIn(
      this.getField('entryDefaultValue').querySelector('input'),
      '10'
    );

    return [{
      name: 'somename',
      dataSpec: {
        type: AtmDataSpecType.Number,
        valueConstraints: {},
      },
      isOptional: true,
      defaultValue: 10,
    }];
  }
}
