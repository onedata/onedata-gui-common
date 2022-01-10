import { expect } from 'chai';
import sinon from 'sinon';
import transformFunctionsIndex from 'onedata-gui-common/utils/one-histogram/transform-functions';

export function createContext() {
  return {
    evaluateTransformFunction: sinon.spy(evaluateTransformFunction),
  };
}

export function evaluateTransformFunction(context, func) {
  if (func) {
    if (func.functionName === 'constValue') {
      return func.functionArguments.value;
    } else if (func.functionName in transformFunctionsIndex) {
      const normalizedContext = context || createContext();
      return transformFunctionsIndex[func.functionName](
        normalizedContext,
        func.functionArguments
      );
    }
  }
  return func;
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
