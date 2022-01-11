import { expect } from 'chai';
import sinon from 'sinon';
import seriesFunctionsIndex from 'onedata-gui-common/utils/one-histogram/series-functions';
import { evaluateTransformFunction } from '../transform-functions/helpers';

export { createConstArgument } from '../transform-functions/helpers';

export function point(timestamp, value) {
  return { timestamp, value };
}

export function createContext() {
  return {
    evaluateTransformFunction: sinon.spy(evaluateTransformFunction),
    evaluateSeriesFunction: sinon.spy(evaluateSeriesFunction),
    lastWindowTimestamp: Math.floor(Date.now() / 1000),
    windowTimeSpan: 60,
    windowsCount: 60,
  };
}

export function evaluateSeriesFunction(context, func) {
  if (func) {
    if (func.functionName === 'constValue') {
      return func.functionArguments.value;
    } else if (func.functionName in seriesFunctionsIndex) {
      return seriesFunctionsIndex[func.functionName](context, func.functionArguments);
    }
  }
  return func;
}

export function expectFunctionsEvaluation(context, functions) {
  functions.forEach(func =>
    expect(context.evaluateSeriesFunction).to.be.calledWith(context, func)
  );
}
