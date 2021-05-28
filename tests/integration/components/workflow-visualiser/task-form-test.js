import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';

const componentClass = 'task-form';
const exampleAtmLambda = {
  name: 'function1',
  summary: 'function1 summary',
};
const exampleTask = {
  id: 't1',
  name: 'task1',
};

describe('Integration | Component | workflow visualiser/task form', function () {
  setupComponentTest('workflow-visualiser/task-form', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      atmLambda: Object.assign({}, exampleAtmLambda),
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'create',
        changeSpy: sinon.spy(),
      });
    });

    itHasModeClass('create');
    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
    itShowsLambdaInfo();

    it('renders "name" field', async function () {
      await render(this);

      const $label = this.$('.name-field .control-label');
      const $field = this.$('.name-field .form-control');
      expect($label.text().trim()).to.equal('Name:');
      expect($field).to.have.attr('type', 'text');
    });

    it('uses lambda name as default value for name field', async function () {
      await render(this);

      expect(this.$('.name-field .form-control')).to.have.value(exampleAtmLambda.name);
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', '');

      expect(this.$('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', 'somename');

      expect(this.$('.name-field')).to.have.class('has-success');
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');

      await render(this);

      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: exampleAtmLambda.name,
        },
        isValid: true,
      });
      changeSpy.reset();

      await fillIn('.name-field .form-control', 'someName');
      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
        },
        isValid: true,
      });
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        task: Object.assign({}, exampleTask),
      });
    });

    itHasModeClass('edit');
    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
    itShowsLambdaInfo();

    it('fills fields with data of passed task on init', async function () {
      await render(this);

      expect(this.$('.name-field .form-control')).to.have.value(exampleTask.name);
    });

    it('does not update form values on passed task change', async function () {
      await render(this);

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await wait();

      expect(this.$('.name-field .form-control')).to.have.value(exampleTask.name);
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'view',
        task: Object.assign({}, exampleTask),
      });
    });

    itHasModeClass('view');
    itShowsLambdaInfo();

    it('fills fields with data of passed task on init', async function () {
      await render(this);

      expect(this.$('.name-field .field-component').text().trim())
        .to.equal(exampleTask.name);
    });

    it('updates form values on passed task change', async function () {
      await render(this);

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await wait();

      expect(this.$('.name-field .field-component').text().trim())
        .to.equal('task2');
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{workflow-visualiser/task-form
    mode=mode
    task=task
    atmLambda=atmLambda
    stores=stores
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
  await wait();
}

function getComponent(testCase) {
  return testCase.$(`.${componentClass}`);
}

function itHasModeClass(mode) {
  const modeClass = `mode-${mode}`;
  it(`has class "${modeClass}"`, async function () {
    await render(this);

    expect(getComponent(this)).to.have.class(modeClass);
  });
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await render(this);

    expect(getComponent(this)).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(this.$('.field-disabled')).to.not.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await render(this);

    expect(getComponent(this)).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(this.$('.field-enabled')).to.not.exist;
  });
}

function itShowsLambdaInfo() {
  it('shows brief information about used lambda', async function () {
    await render(this);

    expect(this.$('.atm-lambda-name').text().trim())
      .to.equal(exampleAtmLambda.name);
    expect(this.$('.atm-lambda-summary').text().trim())
      .to.equal(exampleAtmLambda.summary);
  });
}
