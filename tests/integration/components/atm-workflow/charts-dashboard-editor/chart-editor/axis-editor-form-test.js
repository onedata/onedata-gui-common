import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewAxis, EditorContext } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneDropdownHelper from '../../../../../helpers/one-dropdown';

const unitDropdownHelper = new OneDropdownHelper('.unitName-field');
const bytesFormatDropdownHelper = new OneDropdownHelper('.bytesUnitOptions-field .format-field');

const units = [{
  value: 'none',
  label: 'None',
}, {
  value: 'milliseconds',
  label: 'Milliseconds',
}, {
  value: 'seconds',
  label: 'Seconds',
}, {
  value: 'bits',
  label: 'Bits',
  optionsKind: 'bytes',
}, {
  value: 'bytes',
  label: 'Bytes',
  optionsKind: 'bytes',
}, {
  value: 'hertz',
  label: 'Hertz',
}, {
  value: 'countsPerSec',
  label: 'Counts per sec.',
}, {
  value: 'bitsPerSec',
  label: 'Bits per sec.',
  optionsKind: 'bytes',
}, {
  value: 'bytesPerSec',
  label: 'Bytes per sec.',
  optionsKind: 'bytes',
}, {
  value: 'operationsPerSec',
  label: 'Operations per sec.',
}, {
  value: 'requestsPerSec',
  label: 'Requests per sec.',
}, {
  value: 'readsPerSec',
  label: 'Reads per sec.',
}, {
  value: 'writesPerSec',
  label: 'Writes per sec.',
}, {
  value: 'ioOperationsPerSec',
  label: 'IO operations per sec.',
}, {
  value: 'percent',
  label: 'Percent',
}, {
  value: 'percentNormalized',
  label: 'Normalized percent',
}, {
  value: 'boolean',
  label: 'Boolean',
}, {
  value: 'custom',
  label: 'Custom',
  optionsKind: 'custom',
}];

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/axis-editor-form', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('editorContext', EditorContext.create());
  });

  it('has class "axis-editor-form"', async function () {
    await renderComponent();

    expect(find('.axis-editor-form')).to.exist;
  });

  it('has three fields - "name", "unit" and "min interval"', async function () {
    await renderComponent();

    const fields = findAll('.field-renderer:not(.form-fields-group-renderer)');
    expect(fields).to.have.length(3);

    expect(fields[0].querySelector('.control-label')).to.contain.text('Name');
    expect(fields[0].querySelector('input[type="text"]')).to.exist;

    expect(fields[1].querySelector('.control-label')).to.contain.text('Unit');
    expect(fields[1].querySelector('.dropdown-field')).to.exist;
    expect(await unitDropdownHelper.getOptionsText())
      .to.deep.equal(units.map(({ label }) => label));

    expect(fields[2].querySelector('.control-label')).to.contain.text('Minimum value interval');
    expect(fields[2].querySelector('input[type="text"]')).to.exist;
  });

  it('shows axis data in fields (no unit options)', async function () {
    this.set('axis', createAxis(this, {
      name: 'name',
      unitName: 'seconds',
    }));

    await renderComponent();

    expect(find('.name-field .form-control')).to.have.value('name');
    expect(unitDropdownHelper.getSelectedOptionText()).to.equal('Seconds');
    expect(find('.minInterval-field .form-control')).to.have.value('');
  });

  it('does not show unit options for simple units', async function () {
    this.set('axis', createAxis(this, {
      name: 'name',
      unitName: units[0].value,
    }));
    await renderComponent();

    const unitsToCheck = units.filter(({ optionsKind }) => !optionsKind);
    for (const { label, value } of unitsToCheck) {
      this.set('axis.unitName', value);
      await settled();
      expect(unitDropdownHelper.getSelectedOptionText()).to.equal(label);
      expect(find('.unit-options-group')).to.not.exist;
    }
  });

  it('shows bytes unit options for bytes-related units', async function () {
    this.set('axis', createAxis(this, {
      name: 'name',
      unitName: units[0].value,
    }));
    await renderComponent();

    const unitsToCheck = units.filter(({ optionsKind }) => optionsKind === 'bytes');
    for (const { label, value } of unitsToCheck) {
      setProperties(this.axis, {
        unitName: value,
      });
      await settled();
      expect(unitDropdownHelper.getSelectedOptionText()).to.equal(label);
      expect(find('.unit-options-group')).to.exist
        .and.to.have.class('bytesUnitOptions-field');
    }
  });

  it('shows custom unit options for custom unit', async function () {
    this.set('axis', createAxis(this, {
      name: 'name',
      unitName: 'custom',
    }));

    await renderComponent();

    expect(unitDropdownHelper.getSelectedOptionText()).to.equal('Custom');
    expect(find('.unit-options-group')).to.exist
      .and.to.have.class('customUnitOptions-field');
  });

  it('has one updatable field in bytes unit options - format', async function () {
    const bytesUnit = units.find(({ optionsKind }) => optionsKind === 'bytes');
    this.set('axis', createAxis(this, {
      name: 'name',
      unitName: bytesUnit.value,
      unitOptions: {
        format: 'iec',
      },
    }));
    await renderComponent();

    const bytesFields = findAll(
      '.unit-options-group .field-renderer:not(.form-fields-group-renderer)'
    );
    expect(bytesFields).to.have.length(1);

    expect(bytesFields[0].querySelector('.control-label')).to.contain.text('Format');
    expect(bytesFields[0].querySelector('.dropdown-field')).to.exist;
    expect(await bytesFormatDropdownHelper.getOptionsText())
      .to.deep.equal(['IEC', 'SI']);
    expect(bytesFormatDropdownHelper.getSelectedOptionText()).to.equal('IEC');

    this.set('axis.unitOptions.format', 'si');
    await settled();

    expect(bytesFormatDropdownHelper.getSelectedOptionText()).to.equal('SI');
  });

  it('has two updatable fields in custom unit options - "name" and "use metric suffix"', async function () {
    this.set('axis', createAxis(this, {
      name: 'name',
      unitName: 'custom',
      unitOptions: {
        customName: 'abc',
        useMetricSuffix: false,
      },
    }));
    await renderComponent();

    const customFields = findAll(
      '.unit-options-group .field-renderer:not(.form-fields-group-renderer)'
    );
    expect(customFields).to.have.length(2);

    expect(customFields[0].querySelector('.control-label')).to.contain.text('Name');
    expect(customFields[0].querySelector('input[type="text"]')).to.exist;
    expect(customFields[1].querySelector('.control-label'))
      .to.contain.text('Use metric suffix');
    expect(customFields[1].querySelector('.one-way-toggle')).to.exist;
    expect(find('.customName-field input')).to.have.value('abc');
    expect(find('.useMetricSuffix-field .one-way-toggle')).to.not.have.class('checked');

    setProperties(this.axis.unitOptions, {
      customName: 'def',
      useMetricSuffix: true,
    });
    await settled();

    expect(find('.customName-field input')).to.have.value('def');
    expect(find('.useMetricSuffix-field .one-way-toggle')).to.have.class('checked');
  });
});

function createAxis(testCase, props = {}) {
  const axis = createNewAxis(testCase.owner.lookup('service:i18n'));
  setProperties(axis, props);
  return axis;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/axis-editor-form
    axis=axis
    editorContext=editorContext
  }}`);
}
