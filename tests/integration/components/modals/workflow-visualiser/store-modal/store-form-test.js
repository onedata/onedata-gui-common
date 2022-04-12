import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from '../../../../../helpers/ember-power-select';
import $ from 'jquery';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { render, settled, click, fillIn, focus, blur, find } from '@ember/test-helpers';

const componentClass = 'store-form';

const storeTypes = [{
  label: 'List',
  type: 'list',
  dataSpecConfigKey: 'itemDataSpec',
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Map',
  //   type: 'map',
}, {
  label: 'Tree forest',
  type: 'treeForest',
  dataSpecConfigKey: 'itemDataSpec',
  availableDataTypeLabels: [
    'Any file',
    'Regular file',
    'Directory',
    'Symbolic link',
    'Dataset',
  ],
}, {
  label: 'Single value',
  type: 'singleValue',
  dataSpecConfigKey: 'itemDataSpec',
}, {
  label: 'Range',
  type: 'range',
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Histogram',
  //   type: 'histogram',
  //   disabledDataTypeSelection: true,
  //   availableDataTypeLabels: ['Histogram'],
}, {
  label: 'Audit log',
  type: 'auditLog',
  dataSpecConfigKey: 'logContentDataSpec',
}];

const dataTypes = [{
  label: 'Integer',
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
}, {
  label: 'String',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
}, {
  label: 'Object',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Histogram',
  //   dataSpec: {
  //     type: 'histogram',
  //     valueConstraints: {},
  //   },
}, {
  label: 'Any file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'ANY',
    },
  },
}, {
  label: 'Regular file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'REG',
    },
  },
}, {
  label: 'Directory',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'DIR',
    },
  },
}, {
  label: 'Symbolic link',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'SYMLNK',
    },
  },
}, {
  label: 'Dataset',
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Archive',
  //   dataSpec: {
  //     type: 'archive',
  //     valueConstraints: {},
  //   },
}, {
  label: 'Range',
  dataSpec: {
    type: 'range',
    valueConstraints: {},
  },
}];

const storeTypesWithGenericConfig = storeTypes.rejectBy('type', 'range');

describe('Integration | Component | modals/workflow visualiser/store modal/store form', function () {
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

    it('has class "mode-create', async function (done) {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-create');
      done();
    });

    it('does not render "id" and "instance id" fields', async function (done) {
      await renderComponent();

      expect(find('.id-field')).to.not.exist;
      expect(find('.instanceId-field')).to.not.exist;
      done();
    });

    it('renders empty "name" field', async function (done) {
      await renderComponent();

      const label = find('.name-field .control-label');
      const field = find('.name-field .form-control');
      expect(label.textContent.trim()).to.equal('Name:');
      expect(field.type).to.equal('text');
      expect(field.value).to.equal('');
      done();
    });

    it('marks "name" field as invalid when it is empty', async function (done) {
      await renderComponent();

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(find('.name-field')).to.have.class('has-error');
      done();
    });

    it('marks "name" field as valid when it is not empty', async function (done) {
      await renderComponent();

      await fillIn('.name-field .form-control', 'somename');

      expect(find('.name-field')).to.have.class('has-success');
      done();
    });

    it('renders empty "description" field', async function (done) {
      await renderComponent();

      const label = find('.description-field .control-label');
      const field = find('.description-field .form-control');
      expect(label.textContent.trim()).to.equal('Description (optional):');
      expect(field.matches('textarea')).to.be.true;
      expect(field.value).to.equal('');
      done();
    });

    it('marks "description" field as valid when it is empty', async function (done) {
      await renderComponent();

      await focus('.description-field .form-control');
      await blur('.description-field .form-control');

      expect(find('.description-field')).to.have.class('has-success');
      done();
    });

    it('renders "type" field with preselected "list" option', async function (done) {
      await renderComponent();

      const label = find('.type-field .control-label');
      const field = find('.type-field .dropdown-field-trigger');
      expect(label.textContent.trim()).to.equal('Type:');
      expect(field.textContent.trim()).to.equal('List');
      done();
    });

    it('provides all needed options to choose in "type" field', async function (done) {
      await renderComponent();

      await clickTrigger('.type-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(storeTypes.length);
      storeTypes.forEach(({ label }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(label)
      );
      done();
    });

    it('notifies about changes of values and validation state', async function (done) {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: '',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: dataTypes[0].dataSpec,
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: false,
      });
      changeSpy.reset();

      await fillIn('.name-field .form-control', 'someName');
      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: dataTypes[0].dataSpec,
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: true,
      });
      done();
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      disabledDataTypeSelection = false,
      dataSpecConfigKey,
      defaultDataTypeLabel,
    }) => {
      it(`shows generic configuration fields for store "${label}"`, async function (done) {
        await renderComponent();

        await selectChoose('.type-field', label);

        expect(find('.genericStoreConfig-collapse')).to.have.class('in');
        expect(find('.rangeStoreConfig-collapse')).to.not.have.class('in');

        const dataTypeField = find('.dataType-field');
        expect(dataTypeField.querySelector('.control-label').textContent.trim())
          .to.equal('Data type:');
        expect(dataTypeField.querySelector('.dropdown-field-trigger').textContent.trim())
          .to.equal(defaultDataTypeLabel || availableDataTypeLabels[0]);
        if (disabledDataTypeSelection) {
          expect(dataTypeField).to.have.class('field-disabled');
        } else {
          expect(dataTypeField).to.have.class('field-enabled');

          await clickTrigger('.dataType-field');

          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(availableDataTypeLabels.length);
          availableDataTypeLabels.forEach((label, idx) =>
            expect($options.eq(idx).text().trim()).to.equal(label)
          );
        }

        const defaultValueField = find('.defaultValue-field');
        expect(defaultValueField.querySelector('.control-label').textContent.trim())
          .to.equal('Default value:');
        expect(defaultValueField.querySelector('.form-control').value).to.equal('');
        done();
      });

      it(`allows to configure new "${label}" store`, async function (done) {
        const changeSpy = this.get('changeSpy');

        await renderComponent();

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await selectChoose('.type-field', label);
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        if (!disabledDataTypeSelection) {
          await selectChoose('.dataType-field', selectedDataTypeLabel);
        }
        await fillIn('.defaultValue-field .form-control', '"someDefault"');
        await click('.needsUserInput-field .one-way-toggle');

        expect(find('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            description: 'someDescription',
            type,
            config: {
              [dataSpecConfigKey]: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
            },
            defaultInitialContent: 'someDefault',
            requiresInitialContent: true,
          },
          isValid: true,
        });
        done();
      });
    });

    it('shows range configuration fields for store "Range"', async function (done) {
      await renderComponent();

      await selectChoose('.type-field', 'Range');

      expect(find('.genericStoreConfig-collapse')).to.not.have.class('in');
      expect(find('.rangeStoreConfig-collapse')).to.have.class('in');

      const rangeStartField = find('.rangeStart-field');
      const rangeEndField = find('.rangeEnd-field');
      const rangeStepField = find('.rangeStep-field');
      expect(rangeStartField.querySelector('.control-label').textContent.trim())
        .to.equal('Range start:');
      expect(rangeStartField.querySelector('.form-control').value).to.equal('0');
      expect(rangeEndField.querySelector('.control-label').textContent.trim())
        .to.equal('Range end:');
      expect(rangeEndField.querySelector('.form-control').value).to.equal('');
      expect(rangeStepField.querySelector('.control-label').textContent.trim())
        .to.equal('Range step:');
      expect(rangeStepField.querySelector('.form-control').value).to.equal('1');
      done();
    });

    it('allows to configure new "Range" store', async function (done) {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Range');
      await fillIn('.rangeStart-field .form-control', '1');
      await fillIn('.rangeEnd-field .form-control', '10');
      await fillIn('.rangeStep-field .form-control', '2');

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: 'someDescription',
          type: 'range',
          defaultInitialContent: {
            start: 1,
            end: 10,
            step: 2,
          },
          requiresInitialContent: false,
        },
        isValid: true,
      });
      done();
    });

    it('has invalid start, end and step fields in "Range" store, when are empty',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '');
        await fillIn('.rangeEnd-field .form-control', '');
        await fillIn('.rangeStep-field .form-control', '');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(find(`.${fieldName}-field`)).to.have.class('has-error')
        );
        done();
      });

    it('has invalid start, end and step fields in "Range" store, when are floats',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '0.5');
        await fillIn('.rangeEnd-field .form-control', '10.5');
        await fillIn('.rangeStep-field .form-control', '1.5');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(find(`.${fieldName}-field`)).to.have.class('has-error')
        );
        done();
      });

    it('has invalid start and end fields in "Range" store, when are equal',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '2');

        ['rangeStart', 'rangeEnd'].forEach(fieldName =>
          expect(find(`.${fieldName}-field`)).to.have.class('has-error')
        );
        expect(find('.rangeStep-field')).to.not.have.class('has-error');
        done();
      });

    it('has invalid start and end fields in "Range" store, when start > end and step > 0',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '3');
        await fillIn('.rangeEnd-field .form-control', '2');
        await fillIn('.rangeStep-field .form-control', '1');

        expect(find('.rangeStart-field .field-message').textContent.trim()).to.equal(
          'This field must be less than the range end when the range step is positive'
        );
        expect(find('.rangeEnd-field .field-message').textContent.trim()).to.equal(
          'This field must be greater than the range start when the range step is positive'
        );
        expect(find('.rangeStep-field')).to.not.have.class('has-error');
        done();
      });

    it('has invalid start and end fields in "Range" store, when start < end and step < 0',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '3');
        await fillIn('.rangeStep-field .form-control', '-1');

        expect(find('.rangeStart-field .field-message').textContent.trim()).to.equal(
          'This field must be greater than the range end when the range step is negative'
        );
        expect(find('.rangeEnd-field .field-message').textContent.trim()).to.equal(
          'This field must be less than the range start when the range step is negative'
        );
        expect(find('.rangeStep-field')).to.not.have.class('has-error');
        done();
      });

    it('has invalid step field in "Range" store, when step is 0',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStep-field .form-control', '     0 ');

        expect(find('.rangeStep-field')).to.have.class('has-error');
        done();
      });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`allows to configure store with "${label}" data type`, async function (done) {
        const changeSpy = this.get('changeSpy');

        await renderComponent();

        await selectChoose('.type-field', 'List');
        await selectChoose('.dataType-field', label);

        expect(changeSpy).to.be.calledWith({
          data: {
            name: '',
            description: '',
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
            defaultInitialContent: null,
            requiresInitialContent: false,
          },
          isValid: false,
        });
        done();
      });
    });

    it('renders unchecked "needs user input" toggle', async function (done) {
      await renderComponent();

      const label = find('.needsUserInput-field .control-label');
      const toggle = find('.needsUserInput-field .one-way-toggle');
      expect(label.textContent.trim()).to.equal('Needs user input:');
      expect(toggle).to.not.have.class('checked');
      done();
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    it('has class "mode-edit', async function (done) {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-edit');
      done();
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      dataSpecConfigKey,
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store on init`, async function (done) {
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        this.set('store', Store.create({
          schemaId: 'store1id',
          instanceId: 'incorrect value that should not exist',
          name: 'store1',
          description: 'desc',
          type: type,
          config: {
            [dataSpecConfigKey]: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
          },
          defaultInitialContent: 'someDefault',
          requiresInitialContent: true,
        }));

        await renderComponent();

        expect(find('.genericStoreConfig-collapse')).to.have.class('in');
        expect(find('.rangeStoreConfig-collapse')).to.not.have.class('in');
        expect(find('.id-field .form-control').value).to.equal('store1id');
        expect(find('.instanceId-field')).to.not.exist;
        expect(find('.name-field .form-control').value).to.equal('store1');
        expect(find('.description-field .form-control').value).to.equal('desc');
        expect(find('.type-field .dropdown-field-trigger').textContent.trim())
          .to.equal(label);
        const dataTypeField = find('.dataType-field');
        expect(dataTypeField.querySelector('.dropdown-field-trigger').textContent.trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect(dataTypeField).to.have.class('field-disabled');
        } else {
          expect(dataTypeField).to.have.class('field-enabled');
        }
        expect(find('.defaultValue-field .form-control').value).to.equal('"someDefault"');
        expect(find('.needsUserInput-field .one-way-toggle')).to.have.class('checked');
        done();
      });
    });

    it('fills fields with data of passed "Range" store on init', async function (done) {
      this.set('store', Store.create({
        schemaId: 'store1id',
        instanceId: 'incorrect value that should not exist',
        name: 'store1',
        description: 'desc',
        type: 'range',
        defaultInitialContent: {
          start: 2,
          end: 6,
          step: 3,
        },
      }));

      await renderComponent();

      expect(find('.genericStoreConfig-collapse')).to.not.have.class('in');
      expect(find('.rangeStoreConfig-collapse')).to.have.class('in');
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field')).to.not.exist;
      expect(find('.name-field .form-control').value).to.equal('store1');
      expect(find('.description-field .form-control').value).to.equal('desc');
      expect(find('.type-field .dropdown-field-trigger').textContent.trim())
        .to.equal('Range');
      expect(find('.rangeStart-field .form-control').value).to.equal('2');
      expect(find('.rangeEnd-field .form-control').value).to.equal('6');
      expect(find('.rangeStep-field .form-control').value).to.equal('3');
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function (done) {
          this.set('store', Store.create({
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
          }));

          await renderComponent();

          expect(find('.dataType-field .dropdown-field-trigger').textContent.trim())
            .to.equal(label);
          done();
        });
    });

    it('does not update form values on passed store change', async function (done) {
      const store1 = this.set('store', Store.create({
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      }));
      await renderComponent();

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await settled();

      expect(find('.name-field .form-control').value).to.equal('store1');
      done();
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('has class "mode-view', async function (done) {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-view');
      done();
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      dataSpecConfigKey,
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store`, async function (done) {
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        this.set('store', Store.create({
          schemaId: 'store1id',
          instanceId: 'store1instanceId',
          name: 'store1',
          description: 'desc',
          type: type,
          config: {
            [dataSpecConfigKey]: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
          },
          defaultInitialContent: 'someDefault',
          requiresInitialContent: true,
        }));

        await renderComponent();

        expect(find('.field-edit-mode')).to.not.exist;
        expect(find('.genericStoreConfig-collapse')).to.have.class('in');
        expect(find('.rangeStoreConfig-collapse')).to.not.exist;
        expect(find('.id-field .form-control').value).to.equal('store1id');
        expect(find('.instanceId-field .form-control').value)
          .to.equal('store1instanceId');
        expect(find('.name-field .field-component').textContent.trim())
          .to.equal('store1');
        expect(find('.description-field .field-component').textContent.trim())
          .to.equal('desc');
        expect(find('.type-field .field-component').textContent.trim())
          .to.equal(label);
        const dataTypeField = find('.dataType-field');
        expect(dataTypeField.querySelector('.field-component').textContent.trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect(dataTypeField).to.have.class('field-disabled');
        } else {
          expect(dataTypeField).to.have.class('field-enabled');
        }
        expect(find('.defaultValue-field .form-control').value)
          .to.equal('"someDefault"');
        expect(find('.needsUserInput-field .one-way-toggle'))
          .to.have.class('checked');
        done();
      });
    });

    it('fills fields with data of passed "Range" store on init', async function (done) {
      this.set('store', Store.create({
        schemaId: 'store1id',
        instanceId: 'store1instanceId',
        name: 'store1',
        description: 'desc',
        type: 'range',
        defaultInitialContent: {
          start: 2,
          end: 6,
          step: 3,
        },
      }));

      await renderComponent();

      expect(find('.field-edit-mode')).to.not.exist;
      expect(find('.genericStoreConfig-collapse')).to.not.exist;
      expect(find('.rangeStoreConfig-collapse')).to.have.class('in');
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field .form-control').value)
        .to.equal('store1instanceId');
      expect(find('.name-field .field-component').textContent.trim())
        .to.equal('store1');
      expect(find('.description-field .field-component').textContent.trim())
        .to.equal('desc');
      expect(find('.type-field .field-component').textContent.trim())
        .to.equal('Range');
      expect(find('.rangeStart-field .field-component').textContent.trim()).to.equal('2');
      expect(find('.rangeEnd-field .field-component').textContent.trim()).to.equal('6');
      expect(find('.rangeStep-field .field-component').textContent.trim()).to.equal('3');
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function (done) {
          this.set('store', Store.create({
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
          }));

          await renderComponent();

          expect(find('.dataType-field .field-component').textContent.trim())
            .to.equal(label);
          done();
        });
    });

    it('updates form values on passed store change', async function (done) {
      const store1 = this.set('store', {
        name: 'store1',
      });
      await renderComponent();

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await settled();

      expect(find('.name-field .field-component').textContent.trim()).to.equal('store2');
      done();
    });

    it('hides description field, when description is empty', async function (done) {
      this.set('store', {});

      await renderComponent();

      expect(find('.description-field')).to.not.exist;
      done();
    });

    it('hides default value field, when default value is empty', async function (done) {
      this.set('store', { defaultInitialContent: null });

      await renderComponent();

      expect(find('.defaultValue-field')).to.not.exist;
      done();
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
  it('has all fields enabled by default', async function (done) {
    await renderComponent();

    expect(find('.store-form')).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(find('.field-disabled')).to.not.exist;
    done();
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function (done) {
    this.set('isDisabled', true);

    await renderComponent();

    expect(find('.store-form')).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(find('.field-enabled')).to.not.exist;
    done();
  });
}
