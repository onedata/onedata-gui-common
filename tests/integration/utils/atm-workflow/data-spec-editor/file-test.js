import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { find, render, settled } from '@ember/test-helpers';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import fileEditor from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors/file';
import { lookupService } from '../../../../helpers/stub-service';

const fileTypeOptions = [{
  value: 'ANY',
  label: 'Any',
}, {
  value: 'REG',
  label: 'Regular',
}, {
  value: 'DIR',
  label: 'Directory',
}, {
  value: 'SYMLNK',
  label: 'Symbolic link',
}];

describe('Integration | Utility | atm workflow/data spec editor/file', function () {
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
    expect(find('.fileType-field .dropdown-field-trigger').textContent.trim())
      .to.equal(fileTypeOptions[0].label);

    await clickTrigger('.fileType-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(fileTypeOptions.length);
    fileTypeOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  for (const { label, value } of fileTypeOptions) {
    it(`allows to choose "${label}" file type`, async function () {
      await renderForm();

      await selectChoose('.fileType-field', label);

      expect(getSelectedFileTypeValue(this)).to.equal(value);
    });
  }

  it('allows to provide value constraints', async function () {
    await renderForm();

    await selectChoose('.fileType-field', 'Regular');

    const valueConstraints = fileEditor.formValuesToValueConstraints(
      this.get('rootGroup.valuesSource.valueConstraintsEditor')
    );
    expect(valueConstraints).to.deep.equal({
      fileType: 'REG',
    });
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('allows to show existing value constraints', async function () {
    const formValues = fileEditor.valueConstraintsToFormValues({
      fileType: 'REG',
    });

    await renderForm();
    this.set('rootGroup.valuesSource.valueConstraintsEditor', formValues);
    await settled();

    expect(find('.fileType-field .dropdown-field-trigger').textContent.trim())
      .to.equal('Regular');
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
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getSelectedFileTypeValue(testCase) {
  return testCase.get('rootGroup.valuesSource.valueConstraintsEditor.fileType');
}