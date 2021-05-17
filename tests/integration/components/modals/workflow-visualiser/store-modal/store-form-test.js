import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { fillIn, focus, blur, click } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../../../helpers/ember-power-select';
import $ from 'jquery';

const componentClass = 'store-form';

const storeTypes = [{
  label: 'List',
  type: 'list',
}, {
  label: 'Map',
  type: 'map',
}, {
  label: 'Tree forest',
  type: 'treeForest',
  availableDataTypeLabels: ['Any file', 'Regular file', 'Directory', 'Dataset'],
}, {
  label: 'Single value',
  type: 'singleValue',
}, {
  label: 'Range',
  type: 'range',
}, {
  label: 'Histogram',
  type: 'histogram',
  disabledDataTypeSelection: true,
  defaultDataTypeLabel: 'Histogram',
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
}, {
  label: 'Histogram',
  dataSpec: {
    type: 'histogram',
    valueConstraints: {},
  },
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
  label: 'Dataset',
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
}, {
  label: 'Archive',
  dataSpec: {
    type: 'archive',
    valueConstraints: {},
  },
}, {
  label: 'Single value store cred.',
  dataSpec: {
    type: 'storeCredentials',
    valueConstraints: {
      storeType: 'singleValue',
    },
  },
}, {
  label: 'List store cred.',
  dataSpec: {
    type: 'storeCredentials',
    valueConstraints: {
      storeType: 'list',
    },
  },
}, {
  label: 'Map store cred.',
  dataSpec: {
    type: 'storeCredentials',
    valueConstraints: {
      storeType: 'map',
    },
  },
}, {
  label: 'Tree forest store cred.',
  dataSpec: {
    type: 'storeCredentials',
    valueConstraints: {
      storeType: 'treeForest',
    },
  },
}, {
  label: 'Range store cred.',
  dataSpec: {
    type: 'storeCredentials',
    valueConstraints: {
      storeType: 'range',
    },
  },
}, {
  label: 'Histogram store cred.',
  dataSpec: {
    type: 'storeCredentials',
    valueConstraints: {
      storeType: 'histogram',
    },
  },
}, {
  label: 'OnedataFS credentials',
  dataSpec: {
    type: 'onedatafsCredentials',
    valueConstraints: {},
  },
}];

const storeTypesWithGenericConfig = storeTypes.rejectBy('type', 'range');

describe('Integration | Component | modals/workflow visualiser/store modal/store form', function () {
  setupComponentTest('modals/workflow-visualiser/store-modal/store-form', {
    integration: true,
  });

  beforeEach(function () {
    this.set('changeSpy', sinon.spy());
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
          // FIXME: uncomment when rebases with the newest workflows gui
          // expect($dataTypeField).to.have.class('field-disabled');
        } else {
          // expect($dataTypeField).to.have.class('field-enabled');

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

      it(`allows to configure new ${label} store`, async function () {
        const changeSpy = this.get('changeSpy');

        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await selectChoose('.type-field', label);
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        if (!disabledDataTypeSelection) {
          await selectChoose('.dataType-field', selectedDataTypeLabel);
        }
        await fillIn('.defaultValue-field .form-control', 'someDefault');

        expect(this.$('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            description: 'someDescription',
            type,
            dataSpec: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
            defaultInitialValue: 'someDefault',
          },
          isValid: true,
        });
      });
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    it('has class "mode-edit', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-edit');
    });

    it('fills fields with data of passed "singleValue" store on init', async function () {
      this.set('store', {
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      });

      await render(this);

      expect(this.$('.name-field .form-control')).to.have.value('store1');
      expect(this.$('.description-field .form-control')).to.have.value('desc');
      expect(this.$('.type-field .dropdown-field-trigger').text().trim())
        .to.equal('Single value');
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
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('has class "mode-view', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-view');
    });

    it('fills fields with data of passed "singleValue" store on init', async function () {
      this.set('store', {
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      });

      await render(this);

      expect(this.$('.field-edit-mode')).to.not.exist;
      expect(this.$('.name-field .field-component').text().trim())
        .to.equal('store1');
      expect(this.$('.description-field .field-component').text().trim())
        .to.equal('desc');
      expect(this.$('.type-field .field-component').text().trim())
        .to.equal('Single value');
    });

    it('updates form values on passed store change', async function () {
      const store1 = this.set('store', {
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      });
      await render(this);

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await wait();

      expect(this.$('.name-field .field-component').text().trim()).to.equal('store2');
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{modals/workflow-visualiser/store-modal/store-form
    mode=mode
    store=store
    onChange=changeSpy
  }}`);
  await wait();
}
