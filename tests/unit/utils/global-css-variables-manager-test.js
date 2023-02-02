import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import { GlobalCssVariablesManager } from 'onedata-gui-common/utils/global-css-variables-manager';

describe('Unit | Utility | global css variables manager', function () {
  beforeEach(function () {
    this.variablesManager = new GlobalCssVariablesManager();
  });

  afterEach(function () {
    this.variablesManager.destroy();
  });

  it('allows to define global variable', function () {
    this.variablesManager.setVariable(0, '--test1', '123');

    expectVariableValue(this, '--test1', '123');
  });

  it('allows to define many global variables', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.setVariable(0, '--test2', '456');
    this.variablesManager.setVariable(1, '--test3', '789');

    expectVariableValue(this, '--test1', '123');
    expectVariableValue(this, '--test2', '456');
    expectVariableValue(this, '--test3', '789');
  });

  it('allows to define global variable by two owners', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.setVariable(1, '--test1', '123');

    expectVariableValue(this, '--test1', '123');
  });

  it('does not allow to change value of global variable set by another owner', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.setVariable(1, '--test1', '123');

    let error;
    try {
      this.variablesManager.setVariable(1, '--test1', '456');
    } catch (e) {
      error = e;
    }

    expectVariableValue(this, '--test1', '123');
    expect(error.toString()).to.contain('Cannot change value of CSS variable');
  });

  it('allows to change value of global variable set by the same (and only) owner', function () {
    this.variablesManager.setVariable(0, '--test1', '123');

    this.variablesManager.setVariable(0, '--test1', '456');

    expectVariableValue(this, '--test1', '456');
  });

  it('deletes global variable when it\'s only owner unsets it', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.unsetVariable(0, '--test1');

    expectVariableValue(this, '--test1', null);
  });

  it('does not delete global variable when it has two owners and one unsets it', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.setVariable(1, '--test1', '123');

    this.variablesManager.unsetVariable(0, '--test1');

    expectVariableValue(this, '--test1', '123');
  });

  it('deletes global variable when all of it\'s owners unset it', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.setVariable(1, '--test1', '123');

    this.variablesManager.unsetVariable(0, '--test1');
    this.variablesManager.unsetVariable(1, '--test1');

    expectVariableValue(this, '--test1', null);
  });

  it('unsets all global variables of specific owner', function () {
    this.variablesManager.setVariable(0, '--test1', '123');
    this.variablesManager.setVariable(0, '--test2', '456');
    this.variablesManager.setVariable(0, '--test3', '789');
    this.variablesManager.setVariable(1, '--test1', '123');

    this.variablesManager.unsetOwnerVariables(0);

    expectVariableValue(this, '--test1', '123');
    expectVariableValue(this, '--test2', null);
    expectVariableValue(this, '--test3', null);
  });
});

function expectVariableValue(testCase, variableName, variableValue) {
  expect(getVariableValueFromDom(variableName)).to.equal(variableValue);
  expect(testCase.variablesManager.getVariable(variableName)).to.equal(variableValue);
}

function getVariableValueFromDom(variableName) {
  return getComputedStyle(document.body).getPropertyValue(variableName) || null;
}
