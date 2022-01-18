import { expect } from 'chai';
import sinon from 'sinon';
import seriesFunctionsIndex from 'onedata-gui-common/utils/one-histogram/series-functions';
import { evaluateTransformFunction } from '../transform-functions/helpers';

export function createContext() {
  const nowTimestamp = Math.floor(Date.now() / 1000);
  return {
    evaluateTransformFunction: sinon.spy(evaluateTransformFunction),
    evaluateSeriesFunction: sinon.spy(evaluateSeriesFunction),
    nowTimestamp,
    lastWindowTimestamp: nowTimestamp,
    timeResolution: 60,
    windowsCount: 60,
  };
}

export function evaluateSeriesFunction(context, func) {
  if (func) {
    if (func.functionName === 'constValue') {
      return func.functionArguments.data;
    } else if (func.functionName in seriesFunctionsIndex) {
      return seriesFunctionsIndex[func.functionName](context, func.functionArguments);
    }
  }
  return {
    type: 'basic',
    data: func,
  };
}

export function createConstArgument(data) {
  return {
    functionName: 'constValue',
    functionArguments: {
      data,
    },
  };
}

export function expectFunctionsEvaluation(context, functions) {
  functions.forEach(func =>
    expect(context.evaluateSeriesFunction).to.be.calledWith(context, func)
  );
}

export function stringifyArgumentData(arg) {
  return JSON.stringify(arg, function (key, value) {
    if (Number.isNaN(value)) {
      return 'NaN';
    }
    if (value && typeof value === 'object' && value.type && value.data) {
      return value.data;
    }
    if (this && typeof this.timestamp === 'number' && 'value' in this) {
      if (key === 'fake' || key === 'newest' || key === 'oldest') {
        return;
      }
    }
    return value;
  });
}
