import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { find, render, settled } from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import fileEditor from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors/file';
import { lookupService } from '../../../../../helpers/stub-service';
import OneDropdownHelper from '../../../../../helpers/one-dropdown';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';

const fileTypeOptions = [{
  value: AtmFileType.Any,
  label: 'Any',
}, {
  value: AtmFileType.Regular,
  label: 'Regular',
}, {
  value: AtmFileType.Directory,
  label: 'Directory',
}, {
  value: AtmFileType.SymbolicLink,
  label: 'Symbolic link',
}];

const fileTypeHelper = new OneDropdownHelper('.fileType-field');

describe('Integration | Utility | atm workflow/data spec editor/value constraints editors/file', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        fileEditor.FormElement.create({
          name: 'valueConstraintsEditor',
        }),
      ],
    }));
  });

  it('shows dropdown with file types', async function () {
    await renderForm();

    expect(find('.fileType-field .control-label').textContent.trim())
      .to.equal('File type:');
    expect(fileTypeHelper.getSelectedOptionText()).to.equal(fileTypeOptions[0].label);
    expect(await fileTypeHelper.getOptionsText())
      .to.deep.equal(fileTypeOptions.map(({ label }) => label));
  });

  for (const { label, value } of fileTypeOptions) {
    it(`allows to choose "${label}" file type`, async function () {
      await renderForm();

      await fileTypeHelper.selectOptionByText(label);

      expect(getSelectedFileTypeValue(this)).to.equal(value);
    });
  }

  it('allows to provide value constraints', async function () {
    await renderForm();

    await fileTypeHelper.selectOptionByText('Regular');

    const valueConstraints = fileEditor.formValuesToValueConstraints(
      this.get('rootGroup.valuesSource.valueConstraintsEditor')
    );
    expect(valueConstraints).to.deep.equal({
      fileType: AtmFileType.Regular,
    });
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('allows to show existing value constraints', async function () {
    const formValues = fileEditor.valueConstraintsToFormValues({
      fileType: AtmFileType.Regular,
    });

    await renderForm();
    this.set('rootGroup.valuesSource.valueConstraintsEditor', formValues);
    await settled();

    expect(fileTypeHelper.getSelectedOptionText()).to.equal('Regular');
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  for (const { label, value } of fileTypeOptions) {
    it(`shows summary for selected "${label}" file type`, function () {
      const formValues = fileEditor.valueConstraintsToFormValues({
        fileType: value,
      });
      const i18n = lookupService(this, 'i18n');

      const summary = String(fileEditor.summarizeFormValues(i18n, formValues));

      expect(summary).to.equal(`File type: ${label}`);
    });
  }

  it('allows to select file types matching typeOrSupertype filter', async function () {
    setFilters(this, [{
      filterType: 'typeOrSupertype',
      types: [{
        type: AtmDataSpecType.File,
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      }],
    }]);
    await renderForm();

    expect(await fileTypeHelper.getOptionsText())
      .to.deep.equal(['Any', 'Regular']);
  });

  it('allows to select file types matching typeOrSubtype filter', async function () {
    setFilters(this, [{
      filterType: 'typeOrSubtype',
      types: [{
        type: AtmDataSpecType.File,
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      }],
    }]);
    await renderForm();

    expect(await fileTypeHelper.getOptionsText()).to.deep.equal(['Regular']);
  });

  it('allows to select file types matching forbiddenType filter', async function () {
    setFilters(this, [{
      filterType: 'forbiddenType',
      types: [{
        type: AtmDataSpecType.File,
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      }],
    }]);
    await renderForm();

    expect(await fileTypeHelper.getOptionsText())
      .to.deep.equal(['Any', 'Directory', 'Symbolic link']);
  });

  it('allows to select file types matching many filters', async function () {
    setFilters(this, [{
      filterType: 'typeOrSupertype',
      types: [{
        type: AtmDataSpecType.File,
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      }],
    }, {
      filterType: 'forbiddenType',
      types: [{
        type: AtmDataSpecType.File,
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      }],
    }]);
    await renderForm();

    expect(await fileTypeHelper.getOptionsText()).to.deep.equal(['Any']);
  });
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getSelectedFileTypeValue(testCase) {
  return testCase.get('rootGroup.valuesSource.valueConstraintsEditor.fileType');
}

function setFilters(testCase, filters) {
  testCase.set('rootGroup.fields.0.dataSpecFilters', filters);
}
