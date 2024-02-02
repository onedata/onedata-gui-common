import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import {
  render,
  settled,
  click,
  fillIn,
  focus,
  blur,
  find,
  findAll,
} from '@ember/test-helpers';
import _ from 'lodash';

const componentClass = 'store-form';

const rangeDefaultValueSetup = {
  defaultValueForTests: {
    start: 2,
    end: 10,
    step: 3,
  },
  async createDefaultValueForTests() {
    await fillIn('.defaultValue-field .start-field input', '2');
    await fillIn('.defaultValue-field .end-field input', '10');
    await fillIn('.defaultValue-field .step-field input', '3');
  },
  expectDefaultValueForTests() {
    expect(find('.defaultValue-field .start-field input')).to.have.value('2');
    expect(find('.defaultValue-field .end-field input')).to.have.value('10');
    expect(find('.defaultValue-field .step-field input')).to.have.value('3');
  },
};
const datasetDefaultValueSetup = {
  defaultValueForTests: {
    datasetId: 'someId',
  },
  async createDefaultValueForTests() {
    await click('.defaultValue-field .dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');
    await fillIn('.defaultValue-field .datasetId-field input', 'someId');
    await click('.defaultValue-field .accept-btn');
  },
  expectDefaultValueForTests() {
    expect(find('.defaultValue-field .dataset-editor'))
      .to.have.class('mode-selected');
  },
};
const arrayOfDatasetsDefaultValueSetup = {
  defaultValueForTests: [datasetDefaultValueSetup.defaultValueForTests],
  createDefaultValueForTests: datasetDefaultValueSetup.createDefaultValueForTests,
  expectDefaultValueForTests() {
    expect('.defaultValue-field .array-editor').to.exist;
    datasetDefaultValueSetup.expectDefaultValueForTests();
  },
};

const storeTypes = [{
  ...arrayOfDatasetsDefaultValueSetup,
  label: 'List',
  type: 'list',
  dataSpecConfigKey: 'itemDataSpec',
}, {
  ...arrayOfDatasetsDefaultValueSetup,
  label: 'Tree forest',
  type: 'treeForest',
  dataSpecConfigKey: 'itemDataSpec',
}, {
  ...datasetDefaultValueSetup,
  label: 'Single value',
  type: 'singleValue',
  dataSpecConfigKey: 'itemDataSpec',
}, {
  ...rangeDefaultValueSetup,
  label: 'Range',
  type: 'range',
}, {
  label: 'Audit log',
  type: 'auditLog',
  dataSpecConfigKey: 'logContentDataSpec',
  defaultDataType: 'object',
}, {
  label: 'Time series',
  type: 'timeSeries',
}, {
  ...arrayOfDatasetsDefaultValueSetup,
  label: 'Exception',
  type: 'exception',
  dataSpecConfigKey: 'itemDataSpec',
  viewOnly: true,
}];

const storeTypesWithGenericConfig = storeTypes
  .filter(({ type }) => type !== 'timeSeries');

describe('Integration | Component | modals/workflow-visualiser/store-modal/store-form', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      changeSpy: sinon.spy(),
      isDisabled: false,
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await render(hbs `{{modals/workflow-visualiser/store-modal/store-form}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class(componentClass);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('mode', 'create');
    });

    it('has class "mode-create', async function () {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-create');
    });

    it('does not render "instance id" field', async function () {
      await renderComponent();

      expect(find('.instanceId-field')).to.not.exist;
    });

    it('renders non-empty "id" field', async function () {
      await renderComponent();

      const label = find('.id-field .control-label');
      const field = find('.id-field .form-control');
      expect(label.textContent.trim()).to.equal('ID:');
      expect(field.type).to.equal('text');
      expect(field.value).to.be.a('string').and.to.have.length.gte(1);
    });

    it('renders empty "name" field', async function () {
      await renderComponent();

      const label = find('.name-field .control-label');
      const field = find('.name-field .form-control');
      expect(label.textContent.trim()).to.equal('Name:');
      expect(field.type).to.equal('text');
      expect(field.value).to.equal('');
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await renderComponent();

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(find('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await renderComponent();

      await fillIn('.name-field .form-control', 'somename');

      expect(find('.name-field')).to.have.class('has-success');
    });

    it('renders empty "description" field', async function () {
      await renderComponent();

      const label = find('.description-field .control-label');
      const field = find('.description-field .form-control');
      expect(label.textContent.trim()).to.equal('Description (optional):');
      expect(field.matches('textarea')).to.be.true;
      expect(field.value).to.equal('');
    });

    it('marks "description" field as valid when it is empty', async function () {
      await renderComponent();

      await focus('.description-field .form-control');
      await blur('.description-field .form-control');

      expect(find('.description-field')).to.have.class('has-success');
    });

    it('renders "type" field with preselected "list" option', async function () {
      await renderComponent();

      const label = find('.type-field .control-label');
      const field = find('.type-field .dropdown-field-trigger');
      expect(label.textContent.trim()).to.equal('Type:');
      expect(field.textContent.trim()).to.equal('List');
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          id: sinon.match.string,
          name: '',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: null,
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: false,
      });
      changeSpy.resetHistory();

      await fillIn('.name-field .form-control', 'someName');
      await selectChoose('.data-spec-editor', 'String');
      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          id: sinon.match.string,
          name: 'someName',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: {
              type: 'string',
            },
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: true,
      });
    });

    storeTypesWithGenericConfig.filter(({ viewOnly }) => !viewOnly).forEach(({
      label,
      type,
      dataSpecConfigKey,
      defaultDataType,
      defaultValueForTests,
      createDefaultValueForTests,
    }) => {
      it(`shows generic configuration fields for store "${label}"`, async function () {
        await renderComponent();

        await selectChoose('.type-field', label);

        expectTimeSeriesConfigExpandState(false);
        if (dataSpecConfigKey) {
          expect(find('.dataSpec-field')).to.exist
            .and.to.contain('.data-spec-editor')
            .and.to.contain.text('Data type');
        }
        if (defaultValueForTests !== undefined) {
          const defaultValueField = find('.defaultValue-field');
          expect(defaultValueField.querySelector('.control-label').textContent.trim())
            .to.equal('Default value:');
          expect(defaultValueField.querySelector('.create-value-btn')).to.exist;
        }
      });

      it(`allows to configure new "${label}" store`, async function () {
        const changeSpy = this.get('changeSpy');

        await renderComponent();

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await selectChoose('.type-field', label);
        if (dataSpecConfigKey) {
          await selectChoose(
            '.data-spec-editor',
            _.upperFirst(defaultDataType) || 'Dataset'
          );
        }
        if (defaultValueForTests !== undefined) {
          await click('.defaultValue-field .create-value-btn');
          await createDefaultValueForTests();
          await click('.needsUserInput-field .one-way-toggle');
        }

        expect(find('.has-error')).to.not.exist;
        const expectedJson = {
          data: {
            id: sinon.match.string,
            name: 'someName',
            description: 'someDescription',
            type,
            defaultInitialContent: defaultValueForTests ?? null,
            requiresInitialContent: defaultValueForTests !== undefined,
          },
          isValid: true,
        };
        if (dataSpecConfigKey) {
          expectedJson.data.config = {
            [dataSpecConfigKey]: {
              type: defaultDataType || 'dataset',
            },
          };
        }
        expect(changeSpy).to.be.calledWith(expectedJson);
      });
    });

    it('shows time series configuration fields for store "Time series"', async function () {
      await renderComponent();

      await selectChoose('.type-field', 'Time series');

      expectTimeSeriesConfigExpandState(true);

      expect(find('.timeSeriesSchema-field')).to.not.exist;
    });

    it('allows to configure new "Time series" store', async function () {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Time series');
      await click('.timeSeriesSchemas-add-field-button');
      await selectChoose('.nameGeneratorType-field', 'Exact');
      await fillIn('.nameGenerator-field .form-control', 'some_name');
      await selectChoose('.unit-field', 'Bytes');
      await click('.metrics-field .tag-creator-trigger');
      await click('.tags-selector .selector-item');

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          id: sinon.match.string,
          name: 'someName',
          description: 'someDescription',
          type: 'timeSeries',
          config: {
            timeSeriesCollectionSchema: {
              timeSeriesSchemas: [{
                nameGeneratorType: 'exact',
                nameGenerator: 'some_name',
                unit: 'bytes',
                metrics: {
                  sum5s: {
                    aggregator: 'sum',
                    resolution: 5,
                    retention: 1440,
                  },
                },
              }],
            },
            dashboardSpec: null,
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: true,
      });
    });

    it('renders unchecked "needs user input" toggle', async function () {
      await renderComponent();

      const label = find('.needsUserInput-field .control-label');
      const toggle = find('.needsUserInput-field .one-way-toggle');
      expect(label.textContent.trim()).to.equal('Needs user input:');
      expect(toggle).to.not.have.class('checked');
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    it('has class "mode-edit', async function () {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-edit');
    });

    storeTypesWithGenericConfig.filter(({ viewOnly }) => !viewOnly).forEach(({
      label,
      type,
      dataSpecConfigKey,
      defaultDataType,
      defaultValueForTests,
      expectDefaultValueForTests,
    }) => {
      it(`fills fields with data of passed "${label}" store on init`, async function () {
        this.set('store', Store.create({
          id: 'store1id',
          instanceId: 'incorrect value that should not exist',
          name: 'store1',
          description: 'desc',
          type: type,
          config: {
            [dataSpecConfigKey]: {
              type: defaultDataType || 'dataset',
            },
          },
          defaultInitialContent: defaultValueForTests ?? null,
          requiresInitialContent: defaultValueForTests !== undefined,
        }));

        await renderComponent();

        expectTimeSeriesConfigExpandState(false);
        expect(find('.id-field .form-control').value).to.equal('store1id');
        expect(find('.instanceId-field')).to.not.exist;
        expect(find('.name-field .form-control').value).to.equal('store1');
        expect(find('.description-field .form-control').value).to.equal('desc');
        expect(find('.type-field .dropdown-field-trigger').textContent.trim())
          .to.equal(label);
        if (defaultDataType) {
          expect(find('.data-spec-editor').textContent.trim())
            .to.equal(_.upperFirst(defaultDataType) || 'Dataset');
        }
        expectDefaultValueForTests?.();
        const needsUserInputToggle = find('.needsUserInput-field .one-way-toggle');
        if (defaultValueForTests !== undefined) {
          expect(needsUserInputToggle).to.have.class('checked');
        } else {
          expect(needsUserInputToggle).to.not.have.class('checked');
        }
      });
    });

    it('fills fields with data of passed "Time series" store on init', async function () {
      this.set('store', Store.create({
        id: 'store1id',
        instanceId: 'incorrect value that should not exist',
        name: 'store1',
        description: 'desc',
        type: 'timeSeries',
        config: {
          timeSeriesCollectionSchema: {
            timeSeriesSchemas: [{
              nameGeneratorType: 'exact',
              nameGenerator: 'some_name',
              unit: 'bytes',
              metrics: {
                sum5s: {
                  aggregator: 'sum',
                  resolution: 5,
                  retention: 1440,
                },
              },
            }],
          },
          dashboardSpec: null,
        },
      }));

      await renderComponent();

      expectTimeSeriesConfigExpandState(true);
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field')).to.not.exist;
      expect(find('.name-field .form-control').value).to.equal('store1');
      expect(find('.description-field .form-control').value).to.equal('desc');
      expect(find('.type-field .dropdown-field-trigger').textContent)
        .to.contain('Time series');
      expect(findAll('.timeSeriesSchema-field')).to.have.length(1);
      expect(find('.nameGeneratorType-field .dropdown-field-trigger').textContent)
        .to.contain('Exact');
      expect(find('.nameGenerator-field .form-control').value).to.equal('some_name');
      expect(find('.unit-field .dropdown-field-trigger').textContent)
        .to.contain('Bytes');
      expect(findAll('.metrics-field .tag-item')).to.have.length(1);
      expect(find('.metrics-field .tag-item').textContent).to.contain('"sum5s" (sum; 5s; 1440 samp.)');
    });

    it('does not update form values on passed store change', async function () {
      const store1 = this.set('store', Store.create({
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      }));
      await renderComponent();

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await settled();

      expect(find('.name-field .form-control').value).to.equal('store1');
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('has class "mode-view', async function () {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-view');
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      dataSpecConfigKey,
      defaultDataType,
      defaultValueForTests,
      expectDefaultValueForTests,
    }) => {
      it(`fills fields with data of passed "${label}" store`, async function () {
        this.set('store', Store.create({
          id: 'store1id',
          instanceId: 'store1instanceId',
          name: 'store1',
          description: 'desc',
          type: type,
          config: dataSpecConfigKey ? {
            [dataSpecConfigKey]: {
              type: defaultDataType || 'dataset',
            },
          } : undefined,
          defaultInitialContent: defaultValueForTests ?? null,
          requiresInitialContent: defaultValueForTests !== undefined,
        }));

        await renderComponent();

        expect(find('.field-edit-mode:not(.field-disabled')).to.not.exist;
        expectTimeSeriesConfigExpandState(false);
        expect(find('.id-field .form-control').value).to.equal('store1id');
        expect(find('.instanceId-field .form-control').value)
          .to.equal('store1instanceId');
        expect(find('.name-field .field-component').textContent.trim())
          .to.equal('store1');
        expect(find('.description-field .field-component').textContent.trim())
          .to.equal('desc');
        expect(find('.type-field .field-component').textContent.trim())
          .to.equal(label);
        if (defaultDataType) {
          expect(find('.data-spec-editor').textContent.trim()).to.equal(
            _.upperFirst(defaultDataType) || 'Dataset'
          );
        }
        expectDefaultValueForTests?.();
        const needsUserInputToggle = find('.needsUserInput-field .one-way-toggle');
        if (defaultValueForTests !== undefined) {
          expect(needsUserInputToggle).to.have.class('checked');
        } else {
          expect(needsUserInputToggle).to.not.have.class('checked');
        }
      });
    });

    it('fills fields with data of passed "Time series" store on init', async function () {
      this.set('store', Store.create({
        id: 'store1id',
        instanceId: 'store1instanceId',
        name: 'store1',
        description: 'desc',
        type: 'timeSeries',
        config: {
          timeSeriesCollectionSchema: {
            timeSeriesSchemas: [{
              nameGeneratorType: 'exact',
              nameGenerator: 'some_name',
              unit: 'bytes',
              metrics: {
                sum5s: {
                  aggregator: 'sum',
                  resolution: 5,
                  retention: 1440,
                },
              },
            }],
          },
          dashboardSpec: null,
        },
      }));

      await renderComponent();

      expect(find('.field-edit-mode')).to.not.exist;
      expectTimeSeriesConfigExpandState(true);
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field .form-control').value).to.equal('store1instanceId');
      expect(find('.name-field .field-component').textContent).to.contain('store1');
      expect(find('.description-field .field-component').textContent).to.contain('desc');
      expect(find('.type-field .field-component').textContent)
        .to.contain('Time series');
      expect(findAll('.timeSeriesSchema-field')).to.have.length(1);
      expect(find('.nameGeneratorType-field .field-component').textContent)
        .to.contain('Exact');
      expect(find('.nameGenerator-field .field-component').textContent).to.contain('some_name');
      expect(find('.unit-field .field-component').textContent)
        .to.contain('Bytes');
      expect(findAll('.metrics-field .tag-item')).to.have.length(1);
      expect(find('.metrics-field .tag-item').textContent).to.contain('"sum5s" (sum; 5s; 1440 samp.)');
    });

    it('updates form values on passed store change', async function () {
      const store1 = this.set('store', {
        name: 'store1',
      });
      await renderComponent();

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await settled();

      expect(find('.name-field .field-component').textContent.trim()).to.equal('store2');
    });

    it('hides description field, when description is empty', async function () {
      this.set('store', {});

      await renderComponent();

      expect(find('.description-field')).to.not.exist;
    });

    it('hides default value field, when default value is empty', async function () {
      this.set('store', { defaultInitialContent: null });

      await renderComponent();

      expect(find('.defaultValue-field')).to.not.exist;
    });
  });
});

async function renderComponent() {
  await render(hbs `{{modals/workflow-visualiser/store-modal/store-form
    mode=mode
    store=store
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await renderComponent();

    expect(find('.store-form')).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(find('.field-disabled')).to.not.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await renderComponent();

    expect(find('.store-form')).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(find('.field-enabled')).to.not.exist;
  });
}

function expectTimeSeriesConfigExpandState(isExpanded) {
  const collapse = find('.timeSeriesStoreConfig-collapse');
  if (isExpanded) {
    expect(collapse).to.have.class('in');
  } else {
    if (collapse) {
      expect(collapse).to.not.have.class('in');
    }
  }
}
