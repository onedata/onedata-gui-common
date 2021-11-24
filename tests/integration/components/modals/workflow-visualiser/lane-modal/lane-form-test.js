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
import { A } from '@ember/array';
import { resolve } from 'rsvp';

const componentClass = 'lane-form';

describe('Integration | Component | modals/workflow visualiser/lane modal/lane form', function () {
  setupComponentTest('modals/workflow-visualiser/lane-modal/lane-form', {
    integration: true,
  });

  beforeEach(function () {
    const definedStores = A([
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
    ]);
    this.setProperties({
      changeSpy: sinon.spy(),
      isDisabled: false,
      definedStores,
      createStoreAction: {
        execute: () => {
          const newStore = { id: 'snew', name: 'new store' };
          definedStores.pushObject(newStore);
          return resolve({ status: 'done', result: newStore });
        },
      },
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

    it('renders "max retries" field with "0" as default value', async function () {
      await render(this);

      const $label = this.$('.maxRetries-field .control-label');
      const $field = this.$('.maxRetries-field .form-control');
      expect($label.text().trim()).to.equal('Max. retries:');
      expect($field).to.have.attr('type', 'number');
      expect($field).to.have.value('0');
    });

    it('marks "max retries" field as invalid when it is empty', async function () {
      await render(this);

      await fillIn('.maxRetries-field .form-control', '');

      expect(this.$('.maxRetries-field')).to.have.class('has-error');
    });

    it('marks "max retries" field as invalid when it contains negative number', async function () {
      await render(this);

      await fillIn('.maxRetries-field .form-control', '-3');

      expect(this.$('.maxRetries-field')).to.have.class('has-error');
    });

    it('marks "max retries" field as invalid when it contains a float number', async function () {
      await render(this);

      await fillIn('.maxRetries-field .form-control', '3.5');

      expect(this.$('.maxRetries-field')).to.have.class('has-error');
    });

    it('marks "max retries" field as valid when it contains a positive integer number', async function () {
      await render(this);

      await fillIn('.maxRetries-field .form-control', '3');

      expect(this.$('.maxRetries-field')).to.have.class('has-success');
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
      const definedStores = this.get('definedStores');
      expect($options).to.have.length(definedStores.length + 1);
      expect($options.eq(0).text().trim()).to.equal('Create store...');
      definedStores.sortBy('name').forEach(({ name }, idx) =>
        expect($options.eq(idx + 1).text().trim()).to.equal(name)
      );
    });

    it('renders "max batch size" field with "100" as default value', async function () {
      await render(this);

      const $label = this.$('.maxBatchSize-field .control-label');
      const $field = this.$('.maxBatchSize-field .form-control');
      expect($label.text().trim()).to.equal('Max. batch size:');
      expect($field).to.have.attr('type', 'number');
      expect($field).to.have.value('100');
    });

    it('marks "max batch size" field as invalid when it is empty', async function () {
      await render(this);

      await fillIn('.maxBatchSize-field .form-control', '');

      expect(this.$('.maxBatchSize-field')).to.have.class('has-error');
    });

    it('marks "max batch size" field as invalid when it contains negative number', async function () {
      await render(this);

      await fillIn('.maxBatchSize-field .form-control', '-3');

      expect(this.$('.maxBatchSize-field')).to.have.class('has-error');
    });

    it('marks "max batch size" field as invalid when it contains a float number', async function () {
      await render(this);

      await fillIn('.maxBatchSize-field .form-control', '3.5');

      expect(this.$('.maxBatchSize-field')).to.have.class('has-error');
    });

    it('marks "max batch size" field as valid when it contains a positive integer number', async function () {
      await render(this);

      await fillIn('.maxBatchSize-field .form-control', '3');

      expect(this.$('.maxBatchSize-field')).to.have.class('has-success');
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: '',
          maxRetries: 0,
          storeIteratorSpec: {
            storeSchemaId: 's1',
            maxBatchSize: 100,
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
          maxRetries: 0,
          storeIteratorSpec: {
            storeSchemaId: 's1',
            maxBatchSize: 100,
          },
        },
        isValid: true,
      });
    });

    it('allows to configure new lane', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.maxRetries-field .form-control', '4');
      await selectChoose('.sourceStore-field', 'store2');
      await fillIn('.maxBatchSize-field .form-control', '200');

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          maxRetries: 4,
          storeIteratorSpec: {
            storeSchemaId: 's2',
            maxBatchSize: 200,
          },
        },
        isValid: true,
      });
    });

    it('allows to configure new lane with store created in place', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await selectChoose('.sourceStore-field', 'Create store...');

      expect(this.$('.has-error')).to.not.exist;
      expect(this.$('.sourceStore-field .dropdown-field-trigger').text().trim())
        .to.equal('new store');
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          maxRetries: 0,
          storeIteratorSpec: {
            storeSchemaId: 'snew',
            maxBatchSize: 100,
          },
        },
        isValid: true,
      });
    });

    it('does not change source store when creating new store in place failed',
      async function () {
        this.set('createStoreAction', { execute: () => resolve({ status: 'failed' }) });
        const changeSpy = this.get('changeSpy');
        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await selectChoose('.sourceStore-field', 'store2');
        await selectChoose('.sourceStore-field', 'Create store...');

        expect(this.$('.has-error')).to.not.exist;
        expect(this.$('.sourceStore-field .dropdown-field-trigger').text().trim())
          .to.equal('store2');
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            maxRetries: 0,
            storeIteratorSpec: {
              storeSchemaId: 's2',
              maxBatchSize: 100,
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

    it('fills fields with data of passed lane', async function () {
      this.set('lane', {
        name: 'lane1',
        maxRetries: 10,
        storeIteratorSpec: {
          storeSchemaId: 's2',
          maxBatchSize: 50,
        },
      });

      await render(this);

      expect(this.$('.name-field .form-control')).to.have.value('lane1');
      expect(this.$('.maxRetries-field .form-control')).to.have.value('10');
      expect(this.$('.sourceStore-field .dropdown-field-trigger').text().trim())
        .to.equal('store2');
      expect(this.$('.maxBatchSize-field .form-control')).to.have.value('50');
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

    it('fills fields with data of passed lane', async function () {
      this.set('lane', {
        name: 'lane1',
        maxRetries: 10,
        storeIteratorSpec: {
          storeSchemaId: 's2',
          maxBatchSize: 50,
        },
      });

      await render(this);

      expect(this.$('.name-field .field-component').text().trim()).to.equal('lane1');
      expect(this.$('.maxRetries-field .field-component').text().trim()).to.equal('10');
      expect(this.$('.sourceStore-field .field-component').text().trim())
        .to.equal('store2');
      expect(this.$('.maxBatchSize-field .field-component').text().trim()).to.equal('50');
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
    definedStores=definedStores
    createStoreAction=createStoreAction
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
