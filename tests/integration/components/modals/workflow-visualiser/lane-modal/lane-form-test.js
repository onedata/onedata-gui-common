import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import {
  render,
  settled,
  fillIn,
  focus,
  blur,
  find,
} from '@ember/test-helpers';
import globals from 'onedata-gui-common/utils/globals';
import { lookupService } from '../../../../../helpers/stub-service';
import { set } from '@ember/object';

const componentClass = 'lane-form';

describe('Integration | Component | modals/workflow-visualiser/lane-modal/lane-form', function () {
  setupRenderingTest();

  beforeEach(function () {
    set(
      lookupService(this, 'workflow-manager'),
      'atmLaneFailForExceptionsRatio',
      0.1
    );
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
    await render(hbs `{{modals/workflow-visualiser/lane-modal/lane-form}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class(componentClass);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('mode', 'create');
    });

    itHasModeClass('create');
    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();

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

    it('renders "max retries" field with "0" as default value', async function () {
      await renderComponent();

      const label = find('.maxRetries-field .control-label');
      const field = find('.maxRetries-field .form-control');
      expect(label.textContent.trim()).to.equal('Max. retries:');
      expect(field.type).to.equal('number');
      expect(field.value).to.equal('0');
    });

    it('marks "max retries" field as invalid when it is empty', async function () {
      await renderComponent();

      await fillIn('.maxRetries-field .form-control', '');

      expect(find('.maxRetries-field')).to.have.class('has-error');
    });

    it('marks "max retries" field as invalid when it contains negative number', async function () {
      await renderComponent();

      await fillIn('.maxRetries-field .form-control', '-3');

      expect(find('.maxRetries-field')).to.have.class('has-error');
    });

    it('marks "max retries" field as invalid when it contains a float number', async function () {
      await renderComponent();

      await fillIn('.maxRetries-field .form-control', '3.5');

      expect(find('.maxRetries-field')).to.have.class('has-error');
    });

    it('marks "max retries" field as valid when it contains a positive integer number', async function () {
      await renderComponent();

      await fillIn('.maxRetries-field .form-control', '3');

      expect(find('.maxRetries-field')).to.have.class('has-success');
    });

    it('renders "fail for exception ratio" field with "0.1" as default value', async function () {
      await renderComponent();

      const label = find('.failForExceptionsRatio-field .control-label');
      const field = find('.failForExceptionsRatio-field .form-control');
      expect(label.textContent.trim()).to.equal('Fail for exception ratio:');
      expect(field.type).to.equal('number');
      expect(field.value).to.equal('0.1');
    });

    it('marks "fail for exception ratio" field as invalid when it is empty', async function () {
      await renderComponent();

      await fillIn('.failForExceptionsRatio-field .form-control', '');

      expect(find('.failForExceptionsRatio-field')).to.have.class('has-error');
    });

    it('marks "fail for exception ratio" field as invalid when it contains negative number',
      async function () {
        await renderComponent();

        await fillIn('.failForExceptionsRatio-field .form-control', '-0.1');

        expect(find('.failForExceptionsRatio-field')).to.have.class('has-error');
      });

    it('marks "fail for exception ratio" field as invalid when it contains a a number > 1', async function () {
      await renderComponent();

      await fillIn('.failForExceptionsRatio-field .form-control', '1.1');

      expect(find('.failForExceptionsRatio-field')).to.have.class('has-error');
    });

    it('marks "fail for exception ratio" field as valid when it contains a positive number < 1',
      async function () {
        await renderComponent();

        await fillIn('.failForExceptionsRatio-field .form-control', '0.2');

        expect(find('.failForExceptionsRatio-field')).to.have.class('has-success');
      });

    it('marks "fail for exception ratio" field as valid when it contains 0', async function () {
      await renderComponent();

      await fillIn('.failForExceptionsRatio-field .form-control', '0');

      expect(find('.failForExceptionsRatio-field')).to.have.class('has-success');
    });

    it('marks "fail for exception ratio" field as valid when it contains 1', async function () {
      await renderComponent();

      await fillIn('.failForExceptionsRatio-field .form-control', '1');

      expect(find('.failForExceptionsRatio-field')).to.have.class('has-success');
    });

    it('has fields group "Iterator options"', async function () {
      await renderComponent();

      expect(find('.iteratorOptions-field .control-label').textContent.trim())
        .to.equal('Iterator options');
    });

    it('renders "source store" field with first store preselected', async function () {
      await renderComponent();

      const label = find('.sourceStore-field .control-label');
      const field = find('.sourceStore-field .dropdown-field-trigger');
      expect(label.textContent.trim()).to.equal('Source store:');
      expect(field.textContent.trim()).to.equal('store1');
    });

    it('provides all stores to choose in "source store" field', async function () {
      await renderComponent();

      await clickTrigger('.sourceStore-field');

      const options = globals.document.querySelectorAll('.ember-power-select-option');
      const definedStores = this.get('definedStores');
      expect(options).to.have.length(definedStores.length + 1);
      expect(options[0].textContent.trim()).to.equal('Create store...');
      definedStores.sortBy('name').forEach(({ name }, idx) =>
        expect(options[idx + 1].textContent.trim()).to.equal(name)
      );
    });

    it('renders "max batch size" field with "10" as default value', async function () {
      await renderComponent();

      const label = find('.maxBatchSize-field .control-label');
      const field = find('.maxBatchSize-field .form-control');
      expect(label.textContent.trim()).to.equal('Max. batch size:');
      expect(field.type).to.equal('number');
      expect(field.value).to.equal('10');
    });

    it('marks "max batch size" field as invalid when it is empty', async function () {
      await renderComponent();

      await fillIn('.maxBatchSize-field .form-control', '');

      expect(find('.maxBatchSize-field')).to.have.class('has-error');
    });

    it('marks "max batch size" field as invalid when it contains negative number', async function () {
      await renderComponent();

      await fillIn('.maxBatchSize-field .form-control', '-3');

      expect(find('.maxBatchSize-field')).to.have.class('has-error');
    });

    it('marks "max batch size" field as invalid when it contains a float number', async function () {
      await renderComponent();

      await fillIn('.maxBatchSize-field .form-control', '3.5');

      expect(find('.maxBatchSize-field')).to.have.class('has-error');
    });

    it('marks "max batch size" field as valid when it contains a positive integer number', async function () {
      await renderComponent();

      await fillIn('.maxBatchSize-field .form-control', '3');

      expect(find('.maxBatchSize-field')).to.have.class('has-success');
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');
      await renderComponent();

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: '',
          maxRetries: 0,
          failForExceptionsRatio: 0.1,
          storeIteratorSpec: {
            storeSchemaId: 's1',
            maxBatchSize: 10,
          },
        },
        isValid: false,
      });
      changeSpy.resetHistory();

      await fillIn('.name-field .form-control', 'someName');
      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          maxRetries: 0,
          failForExceptionsRatio: 0.1,
          storeIteratorSpec: {
            storeSchemaId: 's1',
            maxBatchSize: 10,
          },
        },
        isValid: true,
      });
    });

    it('allows to configure new lane', async function () {
      const changeSpy = this.get('changeSpy');
      await renderComponent();

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.maxRetries-field .form-control', '4');
      await fillIn('.failForExceptionsRatio-field .form-control', '0.2');
      await selectChoose('.sourceStore-field', 'store2');
      await fillIn('.maxBatchSize-field .form-control', '200');

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          maxRetries: 4,
          failForExceptionsRatio: 0.2,
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
      await renderComponent();

      await fillIn('.name-field .form-control', 'someName');
      await selectChoose('.sourceStore-field', 'Create store...');

      expect(find('.has-error')).to.not.exist;
      expect(find('.sourceStore-field .dropdown-field-trigger').textContent.trim())
        .to.equal('new store');
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          maxRetries: 0,
          failForExceptionsRatio: 0.1,
          storeIteratorSpec: {
            storeSchemaId: 'snew',
            maxBatchSize: 10,
          },
        },
        isValid: true,
      });
    });

    it('does not change source store when creating new store in place failed',
      async function () {
        this.set('createStoreAction', { execute: () => resolve({ status: 'failed' }) });
        const changeSpy = this.get('changeSpy');
        await renderComponent();

        await fillIn('.name-field .form-control', 'someName');
        await selectChoose('.sourceStore-field', 'store2');
        await selectChoose('.sourceStore-field', 'Create store...');

        expect(find('.has-error')).to.not.exist;
        expect(find('.sourceStore-field .dropdown-field-trigger').textContent.trim())
          .to.equal('store2');
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            maxRetries: 0,
            failForExceptionsRatio: 0.1,
            storeIteratorSpec: {
              storeSchemaId: 's2',
              maxBatchSize: 10,
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
        failForExceptionsRatio: 0.2,
        storeIteratorSpec: {
          storeSchemaId: 's2',
          maxBatchSize: 50,
        },
      });

      await renderComponent();

      expect(find('.name-field .form-control').value).to.equal('lane1');
      expect(find('.maxRetries-field .form-control').value).to.equal('10');
      expect(find('.failForExceptionsRatio-field .form-control').value).to.equal('0.2');
      expect(find('.sourceStore-field .dropdown-field-trigger').textContent.trim())
        .to.equal('store2');
      expect(find('.maxBatchSize-field .form-control').value).to.equal('50');
    });

    it('does not update form values on passed lane change', async function () {
      const lane1 = this.set('lane', {
        name: 'lane1',
      });
      await renderComponent();

      this.set('lane', Object.assign({}, lane1, { name: 'lane2' }));
      await settled();

      expect(find('.name-field .form-control').value).to.equal('lane1');
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
        failForExceptionsRatio: 0.2,
        storeIteratorSpec: {
          storeSchemaId: 's2',
          maxBatchSize: 50,
        },
      });

      await renderComponent();

      expect(find('.name-field .field-component').textContent.trim()).to.equal('lane1');
      expect(find('.maxRetries-field .field-component').textContent.trim()).to.equal('10');
      expect(find('.failForExceptionsRatio-field .field-component').textContent.trim())
        .to.equal('0.2');
      expect(find('.sourceStore-field .field-component').textContent.trim())
        .to.equal('store2');
      expect(find('.maxBatchSize-field .field-component').textContent.trim()).to.equal('50');
    });

    it('updates form values on passed lane change', async function () {
      const lane1 = this.set('lane', {
        name: 'lane1',
      });
      await renderComponent();

      this.set('lane', Object.assign({}, lane1, { name: 'lane2' }));
      await settled();

      expect(find('.name-field .field-component').textContent.trim()).to.equal('lane2');
    });
  });
});

async function renderComponent() {
  await render(hbs `{{modals/workflow-visualiser/lane-modal/lane-form
    mode=mode
    lane=lane
    definedStores=definedStores
    createStoreAction=createStoreAction
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
}

function itHasModeClass(mode) {
  it(`has class "mode-${mode}`, async function () {
    await renderComponent();

    expect(find(`.${componentClass}`)).to.have.class(`mode-${mode}`);
  });
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await renderComponent();

    expect(find(`.${componentClass}`)).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(find('.field-disabled')).to.not.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await renderComponent();

    expect(find(`.${componentClass}`)).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(find('.field-enabled')).to.not.exist;
  });
}
