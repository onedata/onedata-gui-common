import { expect } from 'chai';
import sinon from 'sinon';

export function createContext() {
  return {
    evaluateTransformFunction: sinon.spy(evaluateTransformFunction),
  };
}

export function evaluateTransformFunction(context, func) {
  if (func && func.functionName === 'constValue') {
    return func.functionArguments.value;
  }
}

export function createConstArgument(value) {
  return {
    functionName: 'constValue',
    functionArguments: {
      value,
    },
  };
}

export function expectFunctionsEvaluation(context, functions) {
  functions.forEach(func =>
    expect(context.evaluateTransformFunction).to.be.calledWith(context, func)
  );
}
