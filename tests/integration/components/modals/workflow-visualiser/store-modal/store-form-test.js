import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { click, fillIn, focus, blur } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../../../helpers/ember-power-select';
import $ from 'jquery';

const componentClass = 'store-form';

const storeTypes = [{
  label: 'List',
  type: 'list',
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Map',
  //   type: 'map',
}, {
  label: 'Tree forest',
  type: 'treeForest',
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
}];

const storeTypesWithGenericConfig = storeTypes.rejectBy('type', 'range');

describe('Integration | Component | modals/workflow visualiser/store modal/store form', function () {
  setupComponentTest('modals/workflow-visualiser/store-modal/store-form', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      changeSpy: sinon.spy(),
      isDisabled: false,
    });
  });

  it(`has class "${componentClass}"`, async function () {
    this.render(hbs `{{modals/workflow-visualiser/store-modal/store-form}}`);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('mode', 'create');
    });

    it('has class "mode-create', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-create');
    });

    it('renders empty "name" field', async function () {
      await render(this);

      const $label = this.$('.name-field .control-label');
      const $field = this.$('.name-field .form-control');
      expect($label.text().trim()).to.equal('Name:');
      expect($field).to.have.attr('type', 'text');
      expect($field).to.have.value('');
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await render(this);

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(this.$('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', 'somename');

      expect(this.$('.name-field')).to.have.class('has-success');
    });

    it('renders empty "description" field', async function () {
      await render(this);

      const $label = this.$('.description-field .control-label');
      const $field = this.$('.description-field .form-control');
      expect($label.text().trim()).to.equal('Description (optional):');
      expect($field).to.match('textarea');
      expect($field).to.have.value('');
    });

    it('marks "description" field as valid when it is empty', async function () {
      await render(this);

      await focus('.description-field .form-control');
      await blur('.description-field .form-control');

      expect(this.$('.description-field')).to.have.class('has-success');
    });

    it('renders "type" field with preselected "list" option', async function () {
      await render(this);

      const $label = this.$('.type-field .control-label');
      const $field = this.$('.type-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Type:');
      expect($field.text().trim()).to.equal('List');
    });

    it('provides all needed options to choose in "type" field', async function () {
      await render(this);

      await clickTrigger('.type-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(storeTypes.length);
      storeTypes.forEach(({ label }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(label)
      );
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');

      await render(this);

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: '',
          description: '',
          type: 'list',
          dataSpec: dataTypes[0].dataSpec,
          defaultInitialValue: null,
          requiresInitialValue: false,
        },
        isValid: false,
      });
      changeSpy.reset();

      await fillIn('.name-field .form-control', 'someName');
      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: '',
          type: 'list',
          dataSpec: dataTypes[0].dataSpec,
          defaultInitialValue: null,
          requiresInitialValue: false,
        },
        isValid: true,
      });
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      disabledDataTypeSelection = false,
      defaultDataTypeLabel,
    }) => {
      it(`shows generic configuration fields for store "${label}"`, async function () {
        await render(this);

        await selectChoose('.type-field', label);

        expect(this.$('.genericStoreConfig-collapse')).to.have.class('in');
        expect(this.$('.rangeStoreConfig-collapse')).to.not.have.class('in');

        const $dataTypeField = this.$('.dataType-field');
        expect($dataTypeField.find('.control-label').text().trim()).to.equal('Data type:');
        expect($dataTypeField.find('.dropdown-field-trigger').text().trim())
          .to.equal(defaultDataTypeLabel || availableDataTypeLabels[0]);
        if (disabledDataTypeSelection) {
          expect($dataTypeField).to.have.class('field-disabled');
        } else {
          expect($dataTypeField).to.have.class('field-enabled');

          await clickTrigger('.dataType-field');

          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(availableDataTypeLabels.length);
          availableDataTypeLabels.forEach((label, idx) =>
            expect($options.eq(idx).text().trim()).to.equal(label)
          );
        }

        const $defaultValueField = this.$('.defaultValue-field');
        expect($defaultValueField.find('.control-label').text().trim())
          .to.equal('Default value:');
        expect($defaultValueField.find('.form-control')).to.have.value('');
      });

      it(`allows to configure new "${label}" store`, async function () {
        const changeSpy = this.get('changeSpy');

        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await selectChoose('.type-field', label);
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        if (!disabledDataTypeSelection) {
          await selectChoose('.dataType-field', selectedDataTypeLabel);
        }
        await fillIn('.defaultValue-field .form-control', '"someDefault"');
        await click('.needsUserInput-field .one-way-toggle');

        expect(this.$('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            description: 'someDescription',
            type,
            dataSpec: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
            defaultInitialValue: 'someDefault',
            requiresInitialValue: true,
          },
          isValid: true,
        });
      });
    });

    it('shows range configuration fields for store "Range"', async function () {
      await render(this);

      await selectChoose('.type-field', 'Range');

      expect(this.$('.genericStoreConfig-collapse')).to.not.have.class('in');
      expect(this.$('.rangeStoreConfig-collapse')).to.have.class('in');

      const $rangeStartField = this.$('.rangeStart-field');
      const $rangeEndField = this.$('.rangeEnd-field');
      const $rangeStepField = this.$('.rangeStep-field');
      expect($rangeStartField.find('.control-label').text().trim())
        .to.equal('Range start:');
      expect($rangeStartField.find('.form-control')).to.have.value('0');
      expect($rangeEndField.find('.control-label').text().trim())
        .to.equal('Range end:');
      expect($rangeEndField.find('.form-control')).to.have.value('');
      expect($rangeStepField.find('.control-label').text().trim())
        .to.equal('Range step:');
      expect($rangeStepField.find('.form-control')).to.have.value('1');
    });

    it('allows to configure new "Range" store', async function () {
      const changeSpy = this.get('changeSpy');

      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Range');
      await fillIn('.rangeStart-field .form-control', '1');
      await fillIn('.rangeEnd-field .form-control', '10');
      await fillIn('.rangeStep-field .form-control', '2');

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: 'someDescription',
          type: 'range',
          dataSpec: {
            type: 'integer',
            valueConstraints: {},
          },
          defaultInitialValue: {
            start: 1,
            end: 10,
            step: 2,
          },
          requiresInitialValue: false,
        },
        isValid: true,
      });
    });

    it('has invalid start, end and step fields in "Range" store, when are empty',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '');
        await fillIn('.rangeEnd-field .form-control', '');
        await fillIn('.rangeStep-field .form-control', '');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(this.$(`.${fieldName}-field`)).to.have.class('has-error')
        );
      });

    it('has invalid start, end and step fields in "Range" store, when are floats',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '0.5');
        await fillIn('.rangeEnd-field .form-control', '10.5');
        await fillIn('.rangeStep-field .form-control', '1.5');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(this.$(`.${fieldName}-field`)).to.have.class('has-error')
        );
      });

    it('has invalid start and end fields in "Range" store, when are equal',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '2');

        ['rangeStart', 'rangeEnd'].forEach(fieldName =>
          expect(this.$(`.${fieldName}-field`)).to.have.class('has-error')
        );
        expect(this.$('.rangeStep-field')).to.not.have.class('has-error');
      });

    it('has invalid start and end fields in "Range" store, when start > end and step > 0',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '3');
        await fillIn('.rangeEnd-field .form-control', '2');
        await fillIn('.rangeStep-field .form-control', '1');

        expect(this.$('.rangeStart-field .field-message').text().trim()).to.equal(
          'This field must be less than the range end when the range step is positive'
        );
        expect(this.$('.rangeEnd-field .field-message').text().trim()).to.equal(
          'This field must be greater than the range start when the range step is positive'
        );
        expect(this.$('.rangeStep-field')).to.not.have.class('has-error');
      });

    it('has invalid start and end fields in "Range" store, when start > end and step > 0',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '3');
        await fillIn('.rangeStep-field .form-control', '-1');

        expect(this.$('.rangeStart-field .field-message').text().trim()).to.equal(
          'This field must be greater than the range end when the range step is negative'
        );
        expect(this.$('.rangeEnd-field .field-message').text().trim()).to.equal(
          'This field must be less than the range start when the range step is negative'
        );
        expect(this.$('.rangeStep-field')).to.not.have.class('has-error');
      });

    it('has invalid step field in "Range" store, when step is 0',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStep-field .form-control', '     0 ');

        expect(this.$('.rangeStep-field')).to.have.class('has-error');
      });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`allows to configure store with "${label}" data type`, async function () {
        const changeSpy = this.get('changeSpy');

        await render(this);

        await selectChoose('.type-field', 'List');
        await selectChoose('.dataType-field', label);

        expect(changeSpy).to.be.calledWith({
          data: {
            name: '',
            description: '',
            type: 'list',
            dataSpec,
            defaultInitialValue: null,
            requiresInitialValue: false,
          },
          isValid: false,
        });
      });
    });

    it('renders unchecked "needs user input" toggle', async function () {
      await render(this);

      const $label = this.$('.needsUserInput-field .control-label');
      const $toggle = this.$('.needsUserInput-field .one-way-toggle');
      expect($label.text().trim()).to.equal('Needs user input:');
      expect($toggle).to.not.have.class('checked');
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    it('has class "mode-edit', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-edit');
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store on init`, async function () {
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        this.set('store', {
          name: 'store1',
          description: 'desc',
          type: type,
          dataSpec: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
          defaultInitialValue: 'someDefault',
          requiresInitialValue: true,
        });

        await render(this);

        expect(this.$('.genericStoreConfig-collapse')).to.have.class('in');
        expect(this.$('.rangeStoreConfig-collapse')).to.not.have.class('in');
        expect(this.$('.name-field .form-control')).to.have.value('store1');
        expect(this.$('.description-field .form-control')).to.have.value('desc');
        expect(this.$('.type-field .dropdown-field-trigger').text().trim()).to.equal(label);
        const $dataTypeField = this.$('.dataType-field');
        expect($dataTypeField.find('.dropdown-field-trigger').text().trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect($dataTypeField).to.have.class('field-disabled');
        } else {
          expect($dataTypeField).to.have.class('field-enabled');
        }
        expect(this.$('.defaultValue-field .form-control')).to.have.value('"someDefault"');
        expect(this.$('.needsUserInput-field .one-way-toggle')).to.have.class('checked');
      });
    });

    it('fills fields with data of passed "Range" store on init', async function () {
      this.set('store', {
        name: 'store1',
        description: 'desc',
        type: 'range',
        dataSpec: {
          type: 'integer',
          valueConstraints: {},
        },
        defaultInitialValue: {
          start: 2,
          end: 6,
          step: 3,
        },
      });

      await render(this);

      expect(this.$('.genericStoreConfig-collapse')).to.not.have.class('in');
      expect(this.$('.rangeStoreConfig-collapse')).to.have.class('in');
      expect(this.$('.name-field .form-control')).to.have.value('store1');
      expect(this.$('.description-field .form-control')).to.have.value('desc');
      expect(this.$('.type-field .dropdown-field-trigger').text().trim())
        .to.equal('Range');
      expect(this.$('.rangeStart-field .form-control')).to.have.value('2');
      expect(this.$('.rangeEnd-field .form-control')).to.have.value('6');
      expect(this.$('.rangeStep-field .form-control')).to.have.value('3');
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function () {
          this.set('store', {
            type: 'list',
            dataSpec: dataSpec,
          });

          await render(this);

          expect(this.$('.dataType-field .dropdown-field-trigger').text().trim())
            .to.equal(label);
        });
    });

    it('does not update form values on passed store change', async function () {
      const store1 = this.set('store', {
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      });
      await render(this);

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await wait();

      expect(this.$('.name-field .form-control')).to.have.value('store1');
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('has class "mode-view', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-view');
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store`, async function () {
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        this.set('store', {
          name: 'store1',
          description: 'desc',
          type: type,
          dataSpec: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
          defaultInitialValue: 'someDefault',
          requiresInitialValue: true,
        });

        await render(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.genericStoreConfig-collapse')).to.have.class('in');
        expect(this.$('.rangeStoreConfig-collapse')).to.not.have.class('in');
        expect(this.$('.name-field .field-component').text().trim())
          .to.equal('store1');
        expect(this.$('.description-field .field-component').text().trim())
          .to.equal('desc');
        expect(this.$('.type-field .field-component').text().trim())
          .to.equal(label);
        const $dataTypeField = this.$('.dataType-field');
        expect(this.$('.dataType-field .field-component').text().trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect($dataTypeField).to.have.class('field-disabled');
        } else {
          expect($dataTypeField).to.have.class('field-enabled');
        }
        expect(this.$('.defaultValue-field .form-control'))
          .to.have.value('"someDefault"');
        expect(this.$('.needsUserInput-field .one-way-toggle'))
          .to.have.class('checked');
      });
    });

    it('fills fields with data of passed "Range" store on init', async function () {
      this.set('store', {
        name: 'store1',
        description: 'desc',
        type: 'range',
        dataSpec: {
          type: 'integer',
          valueConstraints: {},
        },
        defaultInitialValue: {
          start: 2,
          end: 6,
          step: 3,
        },
      });

      await render(this);

      expect(this.$('.field-edit-mode')).to.not.exist;
      expect(this.$('.genericStoreConfig-collapse')).to.not.have.class('in');
      expect(this.$('.rangeStoreConfig-collapse')).to.have.class('in');
      expect(this.$('.name-field .field-component').text().trim())
        .to.equal('store1');
      expect(this.$('.description-field .field-component').text().trim())
        .to.equal('desc');
      expect(this.$('.type-field .field-component').text().trim())
        .to.equal('Range');
      expect(this.$('.rangeStart-field .field-component').text().trim()).to.equal('2');
      expect(this.$('.rangeEnd-field .field-component').text().trim()).to.equal('6');
      expect(this.$('.rangeStep-field .field-component').text().trim()).to.equal('3');
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function () {
          this.set('store', {
            type: 'list',
            dataSpec: dataSpec,
          });

          await render(this);

          expect(this.$('.dataType-field .field-component').text().trim())
            .to.equal(label);
        });
    });

    it('updates form values on passed store change', async function () {
      const store1 = this.set('store', {
        name: 'store1',
      });
      await render(this);

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await wait();

      expect(this.$('.name-field .field-component').text().trim()).to.equal('store2');
    });

    it('hides description field, when description is empty', async function () {
      this.set('store', {});

      await render(this);

      expect(this.$('.description-field')).to.not.exist;
    });

    it('hides default value field, when default value is empty', async function () {
      this.set('store', { defaultInitialValue: null });

      await render(this);

      expect(this.$('.defaultValue-field')).to.not.exist;
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{modals/workflow-visualiser/store-modal/store-form
    mode=mode
    store=store
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
  await wait();
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await render(this);

    expect(this.$('.store-form')).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(this.$('.field-disabled')).to.not.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await render(this);

    expect(this.$('.store-form')).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(this.$('.field-enabled')).to.not.exist;
  });
}
