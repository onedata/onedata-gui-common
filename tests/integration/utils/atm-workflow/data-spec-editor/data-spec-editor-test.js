import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { find, findAll, fillIn, render, click } from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  FormElement,
  formValuesToDataSpec,
  dataSpecToFormValues
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import OneDrodopdownHelper from '../../../../helpers/one-dropdown';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { set } from '@ember/object';

const atmDataSpecTypesInfo = [{
  type: 'integer',
  label: 'Integer',
}, {
  type: 'string',
  label: 'String',
}, {
  type: 'object',
  label: 'Object',
}, {
  type: 'file',
  label: 'File',
}, {
  type: 'dataset',
  label: 'Dataset',
}, {
  type: 'range',
  label: 'Range',
}, {
  type: 'array',
  label: 'Array',
}, {
  type: 'timeSeriesMeasurement',
  label: 'Time series measurement',
}];

const simpleAtmDataSpecTypesInfo = atmDataSpecTypesInfo.filter(({ type }) =>
  !['file', 'array', 'timeSeriesMeasurement'].includes(type)
);
const atmDataSpecTypeHelper = new OneDrodopdownHelper('.data-type-selector');
const fileTypeHelper = new OneDrodopdownHelper('.fileType-field');

describe('Integration | Utility | atm workflow/data spec editor/data spec editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        FormElement.create({
          name: 'dataSpecEditor',
        }),
      ],
    }));
  });

  context('in edit mode', function () {
    it('shows dropdown with all data spec types', async function (done) {
      await renderForm();

      expect(atmDataSpecTypeHelper.getSelectedOptionText()).to.be.null;
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(atmDataSpecTypesInfo.map(({ label }) => label));
      done();
    });

    it('has "Select type..." dropdown placeholder', async function (done) {
      await renderForm();

      expect(atmDataSpecTypeHelper.getPlaceholder()).to.equal('Select type...');
      done();
    });

    simpleAtmDataSpecTypesInfo.forEach(({ type, label }) => {
      it(`allows to create ${type} type data spec`, async function (done) {
        await renderForm();

        await atmDataSpecTypeHelper.selectOptionByText(label);
        expect(getCreatedAtmDataSpec(this)).to.deep.equal({
          type,
          valueConstraints: {},
        });
        done();
      });
    });

    it('allows to create file type data spec', async function (done) {
      await renderForm();

      await atmDataSpecTypeHelper.selectOptionByText('File');
      await click('.form-summary-toggle');
      await fileTypeHelper.selectOptionByText('Regular');
      expect(getCreatedAtmDataSpec(this)).to.deep.equal({
        type: 'file',
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      });
      done();
    });

    it('allows to create time series measurement type data spec', async function (done) {
      await renderForm();

      await atmDataSpecTypeHelper.selectOptionByText('Time series measurement');
      await click('.form-summary-toggle');
      await click('.add-field-button');
      await fillIn('.nameMatcher-field input', 'series1');
      expect(getCreatedAtmDataSpec(this)).to.deep.equal({
        type: 'timeSeriesMeasurement',
        valueConstraints: {
          specs: [{
            nameMatcherType: 'exact',
            nameMatcher: 'series1',
            unit: 'none',
          }],
        },
      });
      done();
    });

    it('allows to create array type data spec', async function (done) {
      await renderForm();

      await atmDataSpecTypeHelper.selectOptionByText('Array');
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      await atmDataSpecTypeHelper.selectOptionByText('String');
      expect(getCreatedAtmDataSpec(this)).to.deep.equal({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'array',
            valueConstraints: {
              itemDataSpec: {
                type: 'string',
                valueConstraints: {},
              },
            },
          },
        },
      });
      done();
    });

    it('has "Select item type..." dropdown placeholder when inside array type', async function (done) {
      await renderForm();

      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(atmDataSpecTypeHelper.getPlaceholder()).to.equal('Select item type...');
      done();
    });

    it('allows to select only types matching typeOrSupertype filter', async function () {
      const filters = [{
        filterType: 'typeOrSupertype',
        types: [{
          type: 'integer',
        }, {
          type: 'array',
          valueConstraints: {
            itemDataSpec: {
              type: 'dataset',
            },
          },
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Integer', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Object', 'Dataset']);
    });

    it('allows to select only types matching typeOrSubtype filter', async function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{
          type: 'integer',
        }, {
          type: 'array',
          valueConstraints: {
            itemDataSpec: {
              type: 'object',
            },
          },
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Integer', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal([
          'Object',
          'File',
          'Dataset',
          'Range',
          'Time series measurement',
        ]);
    });

    it('allows to select only types matching forbiddenType filter', async function () {
      const filters = [{
        filterType: 'forbiddenType',
        types: [{
          type: 'object',
        }, {
          type: 'integer',
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['String', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['String', 'Array']);
    });

    it('allows to select only types matching combination of filters', async function () {
      const filters = [{
        filterType: 'typeOrSupertype',
        types: [{
          type: 'integer',
        }, {
          type: 'array',
          valueConstraints: {
            itemDataSpec: {
              type: 'dataset',
            },
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: 'dataset',
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Integer', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Object']);
    });

    it('allows to select only file types matching filter typeOrSubtype', async function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['File']);
      await atmDataSpecTypeHelper.selectOptionByText('File');
      await click('.form-summary-toggle');
      expect(await fileTypeHelper.getOptionsText())
        .to.deep.equal(['Regular', 'Directory']);
    });
  });

  context('in view mode', function () {
    beforeEach(function () {
      this.get('rootGroup').changeMode('view');
    });

    it('does not show dropdown with data spec types', async function (done) {
      await renderForm();

      expect(atmDataSpecTypeHelper.getTrigger()).to.be.null;
      done();
    });

    simpleAtmDataSpecTypesInfo.forEach(({ type, label }) => {
      it(`shows ${type} type data spec`, async function (done) {
        setVisibleAtmDataSpec(this, {
          type,
          valueConstraints: {},
        });
        await renderForm();

        expect(find('.data-type-name')).to.have.trimmed.text(label);
        done();
      });
    });

    it('shows file type data spec', async function (done) {
      setVisibleAtmDataSpec(this, {
        type: 'file',
        valueConstraints: {
          fileType: AtmFileType.Regular,
        },
      });
      await renderForm();
      await click('.form-summary-toggle');

      expect(find('.data-type-name')).to.have.trimmed.text('File');
      expect(find('.form-summary-toggle')).to.contain.text('Regular');
      expect(find('.fileType-field')).to.contain.text('Regular');
      done();
    });

    it('shows time series measurement type data spec', async function (done) {
      setVisibleAtmDataSpec(this, {
        type: 'timeSeriesMeasurement',
        valueConstraints: {
          specs: [{
            nameMatcherType: 'exact',
            nameMatcher: 'series1',
            unit: 'none',
          }],
        },
      });
      await renderForm();
      await click('.form-summary-toggle');

      expect(find('.data-type-name')).to.have.trimmed.text('Time series measurement');
      expect(find('.form-summary-toggle')).to.contain.text('Defined measurements: 1');
      expect(find('.nameMatcher-field')).to.contain.text('series1');
      done();
    });

    it('shows array type data spec', async function (done) {
      setVisibleAtmDataSpec(this, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'array',
            valueConstraints: {
              itemDataSpec: {
                type: 'string',
                valueConstraints: {},
              },
            },
          },
        },
      });
      await renderForm();

      const dataTypeNames = findAll('.data-type-name')
        .map((node) => node.textContent.trim());
      expect(dataTypeNames).to.deep.equal(['Array', 'Array', 'String']);
      done();
    });
  });
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getCreatedAtmDataSpec(testCase) {
  return formValuesToDataSpec(testCase.get('rootGroup').dumpValue().dataSpecEditor);
}

function setVisibleAtmDataSpec(testCase, atmDataSpec) {
  const rootGroup = testCase.get('rootGroup');
  rootGroup.reset();
  set(rootGroup, 'valuesSource.dataSpecEditor', dataSpecToFormValues(atmDataSpec));
}

function setFilters(testCase, filters) {
  testCase.set('rootGroup.fields.0.dataSpecFilters', filters);
}
