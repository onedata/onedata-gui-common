import { expect } from 'chai';
import sinon from 'sinon';
import seriesFunctionsIndex from 'onedata-gui-common/utils/one-time-series-chart/series-functions';
import { evaluateTransformFunction } from '../transform-functions/helpers';

export function createContext() {
  const newestPointTimestamp = Math.floor(Date.now() / 1000);
  return {
    evaluateTransformFunction: sinon.spy(evaluateTransformFunction),
    evaluateSeriesFunction: sinon.spy(evaluateSeriesFunction),
    newestPointTimestamp,
    lastPointTimestamp: newestPointTimestamp,
    timeResolution: 60,
    pointsCount: 60,
  };
}

export async function evaluateSeriesFunction(context, func) {
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
  const typedData = data && data.type ? data : {
    type: 'basic',
    data,
  };
  return {
    functionName: 'constValue',
    functionArguments: {
      data: typedData,
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
