import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { fillIn, focus, blur } from 'ember-native-dom-helpers';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { clickTrigger, selectChoose } from '../../../../../helpers/ember-power-select';
import $ from 'jquery';

const componentClass = 'lane-form';

describe('Integration | Component | modals/workflow visualiser/lane modal/lane form', function () {
  setupComponentTest('modals/workflow-visualiser/lane-modal/lane-form', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      changeSpy: sinon.spy(),
      isDisabled: false,
      stores: [
        // random order to test sorting
        Store.create({
          id: 's3',
          name: 'store3',
        }),
        Store.create({
          id: 's1',
          name: 'store1',
        }),
        Store.create({
          id: 's2',
          name: 'store2',
        }),
      ],
    });
  });

  it(`has class "${componentClass}"`, async function () {
    this.render(hbs `{{modals/workflow-visualiser/lane-modal/lane-form}}`);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('mode', 'create');
    });

    itHasModeClass('create');
    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();

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

    it('has fields group "Iterator options"', async function () {
      await render(this);

      expect(this.$('.iteratorOptions-field .control-label').eq(0).text().trim())
        .to.equal('Iterator options');
    });

    it('renders "source store" field with first store preselected', async function () {
      await render(this);

      const $label = this.$('.sourceStore-field .control-label');
      const $field = this.$('.sourceStore-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Source store:');
      expect($field.text().trim()).to.equal('store1');
    });

    it('provides all stores to choose in "source store" field', async function () {
      await render(this);

      await clickTrigger('.sourceStore-field');

      const $options = $('.ember-power-select-option');
      const stores = this.get('stores');
      expect($options).to.have.length(stores.length);
      stores.sortBy('name').forEach(({ name }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(name)
      );
    });

    it('renders "strategy" field with "serial" option preselected', async function () {
      await render(this);

      const $label = this.$('.strategy-field .control-label');
      const $field = this.$('.strategy-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Strategy:');
      expect($field.text().trim()).to.equal('Serial');
    });

    it('provides all possible options to choose in "strategy" field', async function () {
      await render(this);

      await clickTrigger('.strategy-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(2);
      ['Serial', 'Batch'].forEach((name, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(name)
      );
    });

    it('does not show batch options when strategy is "Serial"', async function () {
      await render(this);

      await selectChoose('.strategy-field', 'Serial');

      expect(this.$('.batchOptions-collapse')).to.not.have.class('in');
    });

    it('shows batch options when strategy is "Batch"', async function () {
      await render(this);

      await selectChoose('.strategy-field', 'Batch');

      expect(this.$('.batchOptions-collapse')).to.have.class('in');
    });

    it('renders "batch size" field with "100" as default value', async function () {
      await render(this);

      const $label = this.$('.batchSize-field .control-label');
      const $field = this.$('.batchSize-field .form-control');
      expect($label.text().trim()).to.equal('Batch size:');
      expect($field).to.have.attr('type', 'number');
      expect($field).to.have.value('100');
    });

    it('marks "batch size" field as invalid when it is empty', async function () {
      await render(this);

      await fillIn('.batchSize-field .form-control', '');

      expect(this.$('.batchSize-field')).to.have.class('has-error');
    });

    it('marks "batch size" field as valid when it is filled with a positive integer',
      async function () {
        await render(this);

        await fillIn('.batchSize-field .form-control', '20');

        expect(this.$('.batchSize-field')).to.have.class('has-success');
      });

    it('marks "batch size" field as invalid when it is filled with a negative integer, zero, real number or random text',
      async function () {
        await render(this);

        for (const inputVal of ['-20', '0', '3.14', 'sometext']) {
          await fillIn('.batchSize-field .form-control', inputVal);
          expect(this.$('.batchSize-field')).to.have.class('has-error');
        }
      });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: '',
          iteratorSpec: {
            strategy: {
              type: 'serial',
            },
            storeSchemaId: 's1',
          },
        },
        isValid: false,
      });
      changeSpy.reset();

      await fillIn('.name-field .form-control', 'someName');
      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          iteratorSpec: {
            strategy: {
              type: 'serial',
            },
            storeSchemaId: 's1',
          },
        },
        isValid: true,
      });
    });

    it('allows to configure new lane with "Serial" iterator', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await selectChoose('.sourceStore-field', 'store2');
      await selectChoose('.strategy-field', 'Serial');

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          iteratorSpec: {
            strategy: {
              type: 'serial',
            },
            storeSchemaId: 's2',
          },
        },
        isValid: true,
      });
    });

    it('allows to configure new lane with "Serial" iterator', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await selectChoose('.sourceStore-field', 'store3');
      await selectChoose('.strategy-field', 'Batch');
      await fillIn('.batchSize-field .form-control', '30');

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          iteratorSpec: {
            strategy: {
              type: 'batch',
              batchSize: 30,
            },
            storeSchemaId: 's3',
          },
        },
        isValid: true,
      });
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    itHasModeClass('edit');
    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();

    it('fills fields with data of passed lane with "serial" iterator', async function () {
      this.set('lane', {
        name: 'lane1',
        iteratorSpec: {
          strategy: {
            type: 'serial',
          },
          storeSchemaId: 's2',
        },
      });

      await render(this);

      expect(this.$('.batchOptions-collapse')).to.not.have.class('in');
      expect(this.$('.name-field .form-control')).to.have.value('lane1');
      expect(this.$('.sourceStore-field .dropdown-field-trigger').text().trim())
        .to.equal('store2');
      expect(this.$('.strategy-field .dropdown-field-trigger').text().trim())
        .to.equal('Serial');
    });

    it('fills fields with data of passed lane with "batch" iterator', async function () {
      this.set('lane', {
        name: 'lane1',
        iteratorSpec: {
          strategy: {
            type: 'batch',
            batchSize: 30,
          },
          storeSchemaId: 's3',
        },
      });

      await render(this);

      expect(this.$('.batchOptions-collapse')).to.have.class('in');
      expect(this.$('.name-field .form-control')).to.have.value('lane1');
      expect(this.$('.sourceStore-field .dropdown-field-trigger').text().trim())
        .to.equal('store3');
      expect(this.$('.strategy-field .dropdown-field-trigger').text().trim())
        .to.equal('Batch');
      expect(this.$('.batchSize-field .form-control')).to.have.value('30');
    });

    it('does not update form values on passed lane change', async function () {
      const lane1 = this.set('lane', {
        name: 'lane1',
      });
      await render(this);

      this.set('lane', Object.assign({}, lane1, { name: 'lane2' }));
      await wait();

      expect(this.$('.name-field .form-control')).to.have.value('lane1');
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itHasModeClass('view');

    it('fills fields with data of passed lane with "serial" iterator', async function () {
      this.set('lane', {
        name: 'lane1',
        iteratorSpec: {
          strategy: {
            type: 'serial',
          },
          storeSchemaId: 's2',
        },
      });

      await render(this);

      expect(this.$('.batchOptions-collapse')).to.not.have.class('in');
      expect(this.$('.name-field .field-component').text().trim()).to.equal('lane1');
      expect(this.$('.sourceStore-field .field-component').text().trim())
        .to.equal('store2');
      expect(this.$('.strategy-field .field-component').text().trim())
        .to.equal('Serial');
    });

    it('fills fields with data of passed lane with "batch" iterator', async function () {
      this.set('lane', {
        name: 'lane1',
        iteratorSpec: {
          strategy: {
            type: 'batch',
            batchSize: 30,
          },
          storeSchemaId: 's3',
        },
      });

      await render(this);

      expect(this.$('.batchOptions-collapse')).to.have.class('in');
      expect(this.$('.name-field .field-component').text().trim()).to.equal('lane1');
      expect(this.$('.sourceStore-field .field-component').text().trim())
        .to.equal('store3');
      expect(this.$('.strategy-field .field-component').text().trim())
        .to.equal('Batch');
      expect(this.$('.batchSize-field .field-component').text().trim()).to.equal('30');
    });

    it('updates form values on passed lane change', async function () {
      const lane1 = this.set('lane', {
        name: 'lane1',
      });
      await render(this);

      this.set('lane', Object.assign({}, lane1, { name: 'lane2' }));
      await wait();

      expect(this.$('.name-field .field-component').text().trim()).to.equal('lane2');
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{modals/workflow-visualiser/lane-modal/lane-form
    mode=mode
    lane=lane
    stores=stores
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
  await wait();
}

function itHasModeClass(mode) {
  it(`has class "mode-${mode}`, async function () {
    await render(this);

    expect(this.$(`.${componentClass}`)).to.have.class(`mode-${mode}`);
  });
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await render(this);

    expect(this.$(`.${componentClass}`)).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(this.$('.field-disabled')).to.not.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await render(this);

    expect(this.$(`.${componentClass}`)).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(this.$('.field-enabled')).to.not.exist;
  });
}
