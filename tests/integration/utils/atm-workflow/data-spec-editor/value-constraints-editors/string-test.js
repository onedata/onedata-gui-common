import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { find, render, settled, click, fillIn } from '@ember/test-helpers';
import _ from 'lodash';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import stringEditor from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors/string';
import { lookupService } from '../../../../../helpers/stub-service';

describe('Integration | Utility | atm-workflow/data-spec-editor/value-constraints-editors/string', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        stringEditor.FormElement.create({
          name: 'valueConstraintsEditor',
        }),
      ],
    }));
  });

  it('shows empty "allowed values" constraint', async function () {
    await renderForm();

    expect(find('.allowedValues-field .control-label').textContent.trim())
      .to.equal('Allowed values:');
    expect(find('.allowedValues-field .create-value-btn')).to.exist
      .and.to.have.trimmed.text('Set allowed values');
    expect(getAllowedValuesValue(this))
      .to.deep.equal({ hasValue: false, value: null });
  });

  it('allows to input string into "allowed values" constraint', async function () {
    await renderForm();

    await click('.allowedValues-field .create-value-btn');
    await click('.allowedValues-field .add-item-trigger');
    await fillIn('.allowedValues-field textarea', 'abc');

    expect(getAllowedValuesValue(this))
      .to.deep.equal({ hasValue: true, value: ['abc'] });
  });

  it('allows clear "allowed values" constraint', async function () {
    await renderForm();
    await click('.allowedValues-field .create-value-btn');
    await click('.allowedValues-field .add-item-trigger');
    await fillIn('.allowedValues-field textarea', 'abc');

    await click('.remove-icon');
    await click('.webui-popover-content .btn-confirm');

    expect(getAllowedValuesValue(this))
      .to.deep.equal({ hasValue: false, value: null });
  });

  it('allows to provide value constraints', async function () {
    await renderForm();

    await click('.allowedValues-field .create-value-btn');
    await click('.allowedValues-field .add-item-trigger');
    await fillIn('.allowedValues-field textarea', 'abc');

    const valueConstraints = stringEditor.formValuesToValueConstraints(
      this.get('rootGroup.valuesSource.valueConstraintsEditor')
    );
    expect(valueConstraints).to.deep.equal({
      allowedValues: ['abc'],
    });
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('allows to show existing value constraints', async function () {
    const formValues = stringEditor.valueConstraintsToFormValues({
      allowedValues: ['abc'],
    });

    await renderForm();
    this.set('rootGroup.valuesSource.valueConstraintsEditor', formValues);
    await settled();

    expect(find('.allowedValues-field textarea')).to.have.value('abc');
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('shows a valid summary when there are no "allowed values"', function () {
    const formValues = stringEditor.valueConstraintsToFormValues({
      allowedValues: null,
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(stringEditor.summarizeFormValues(i18n, formValues));

    expect(summary).to.equal('Allowed strings: Any');
  });

  it('shows a valid summary when there are "allowed values"', function () {
    const formValues = stringEditor.valueConstraintsToFormValues({
      allowedValues: ['a', 'b'],
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(stringEditor.summarizeFormValues(i18n, formValues));

    // Using escape because `"` gets encoded as `&quot;` entity
    expect(summary).to.equal(_.escape('Allowed strings: "a", "b"'));
  });
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getAllowedValuesValue(testCase) {
  return testCase.get('rootGroup.valuesSource.valueConstraintsEditor.allowedValues');
}
