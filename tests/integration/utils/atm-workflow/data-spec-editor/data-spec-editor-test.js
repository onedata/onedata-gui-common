import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  find,
  findAll,
  fillIn,
  render,
  click,
} from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  FormElement,
  formValuesToDataSpec,
  dataSpecToFormValues,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import OneDrodopdownHelper from '../../../../helpers/one-dropdown';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { set } from '@ember/object';

const atmDataSpecTypesInfo = [{
  type: AtmDataSpecType.Number,
  label: 'Number',
}, {
  type: AtmDataSpecType.Boolean,
  label: 'Boolean',
}, {
  type: AtmDataSpecType.String,
  label: 'String',
}, {
  type: AtmDataSpecType.Object,
  label: 'Object',
}, {
  type: AtmDataSpecType.File,
  label: 'File',
}, {
  type: AtmDataSpecType.Dataset,
  label: 'Dataset',
}, {
  type: AtmDataSpecType.Range,
  label: 'Range',
}, {
  type: AtmDataSpecType.Array,
  label: 'Array',
}, {
  type: AtmDataSpecType.TimeSeriesMeasurement,
  label: 'Time series measurement',
}];

const simpleAtmDataSpecTypesInfo = atmDataSpecTypesInfo.filter(({ type }) =>
  ![AtmDataSpecType.File, AtmDataSpecType.Array, AtmDataSpecType.TimeSeriesMeasurement]
  .includes(type)
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
        type: AtmDataSpecType.File,
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
        type: AtmDataSpecType.TimeSeriesMeasurement,
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
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Array,
            valueConstraints: {
              itemDataSpec: {
                type: AtmDataSpecType.String,
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
          type: AtmDataSpecType.Number,
        }, {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Dataset,
            },
          },
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Number', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Object', 'Dataset']);
    });

    it('allows to select only types matching typeOrSubtype filter', async function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.Number,
        }, {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Object,
            },
          },
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Number', 'Array']);
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
          type: AtmDataSpecType.Object,
        }, {
          type: AtmDataSpecType.Number,
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Boolean', 'String', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Boolean', 'String', 'Array']);
    });

    it('allows to select only types matching combination of filters', async function () {
      const filters = [{
        filterType: 'typeOrSupertype',
        types: [{
          type: AtmDataSpecType.Number,
        }, {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Dataset,
            },
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.Dataset,
        }],
      }];
      setFilters(this, filters);
      await renderForm();

      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Number', 'Array']);
      await atmDataSpecTypeHelper.selectOptionByText('Array');
      expect(await atmDataSpecTypeHelper.getOptionsText())
        .to.deep.equal(['Object']);
    });

    it('allows to select only file types matching filter typeOrSubtype', async function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: AtmDataSpecType.File,
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
        type: AtmDataSpecType.File,
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
        type: AtmDataSpecType.TimeSeriesMeasurement,
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
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Array,
            valueConstraints: {
              itemDataSpec: {
                type: AtmDataSpecType.String,
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
