import { expect } from 'chai';
import { describe, it } from 'mocha';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';

const arrayDataSpec = {
  type: AtmDataSpecType.Array,
  valueConstraints: {
    itemDataSpec: {
      type: 'number',
    },
  },
};
const booleanDataSpec = { type: AtmDataSpecType.Boolean };
const datasetDataSpec = { type: AtmDataSpecType.Dataset };
const fileDataSpec = {
  type: AtmDataSpecType.File,
  valueConstraints: {
    fileType: AtmFileType.Regular,
  },
};
const numberDataSpec = { type: AtmDataSpecType.Number };
const objectDataSpec = { type: AtmDataSpecType.Object };
const rangeDataSpec = { type: AtmDataSpecType.Range };
const stringDataSpec = { type: AtmDataSpecType.String };
const timeSeriesMeasurementDataSpec = { type: AtmDataSpecType.TimeSeriesMeasurement };

describe('Unit | Utility | atm-workflow/value-validators', function () {
  [
    [],
    [1],
    [1, 2.5],
  ].forEach((value) =>
    itRecognizesValueAsValid(value, arrayDataSpec)
  );
  [
    ['1'],
    [1, '2.5'],
    'abc',
    132,
    NaN,
    true,
    null,
    undefined,
    {},
  ].forEach((value) =>
    itRecognizesValueAsInvalid(value, arrayDataSpec)
  );

  [true, false].forEach((value) =>
    itRecognizesValueAsValid(value, booleanDataSpec)
  );
  [
    '',
    123,
    null,
    undefined,
    {},
    [],
  ].forEach((value) =>
    itRecognizesValueAsInvalid(value, booleanDataSpec)
  );

  [{
    datasetId: 'abc',
  }, {
    datasetId: 'abc',
    someKey: 'xyz',
  }].forEach((value) =>
    itRecognizesValueAsValid(value, datasetDataSpec)
  );
  [
    { datasetId: '' },
    { datasetId: null },
    'abc',
    132,
    NaN,
    true,
    null,
    undefined,
    {},
    [],
  ].forEach((value) =>
    itRecognizesValueAsInvalid(value, datasetDataSpec)
  );

  [{
    file_id: 'abc',
  }, {
    file_id: 'abc',
    someKey: 'xyz',
  }].forEach((value) =>
    itRecognizesValueAsValid(value, fileDataSpec)
  );
  [
    { file_id: '' },
    { file_id: null },
    'abc',
    132,
    NaN,
    true,
    null,
    undefined,
    {},
    [],
  ].forEach((value) =>
    itRecognizesValueAsInvalid(value, fileDataSpec)
  );

  [-10, 0, 10, 1.25].forEach((value) =>
    itRecognizesValueAsValid(value, numberDataSpec)
  );
  ['', NaN, true, null, undefined, {}].forEach((value) =>
    itRecognizesValueAsInvalid(value, numberDataSpec)
  );

  [{}, { someKey: 123 }].forEach((value) =>
    itRecognizesValueAsValid(value, objectDataSpec)
  );
  ['abc', 132, NaN, true, null, undefined, []].forEach((value) =>
    itRecognizesValueAsInvalid(value, objectDataSpec)
  );

  [{
    end: 10,
  }, {
    end: 0,
  }, {
    start: 1,
    end: 10,
  }, {
    start: 10,
    end: 10,
  }, {
    start: -11,
    end: -10,
  }, {
    end: 10,
    step: 2,
  }, {
    end: -10,
    step: -2,
  }, {
    start: -10,
    end: 10,
    step: 2,
  }, {
    start: 10,
    end: -10,
    step: -2,
  }, {
    start: 0,
    end: 0,
    step: 2,
  }].forEach((value) =>
    itRecognizesValueAsValid(value, rangeDataSpec)
  );
  [{
    end: -10,
  }, {
    start: 1,
  }, {
    start: 1,
    end: 0,
  }, {
    end: 10,
    step: -2,
  }, {
    end: -10,
    step: 2,
  }, {
    end: 10,
    step: 0,
  }, {
    start: -10,
    end: 10,
    step: -2,
  }, {
    start: 10,
    end: -10,
    step: 2,
  }, {
    start: '-10',
    end: 10,
    step: 2,
  }, {
    start: -10,
    end: '10',
    step: 2,
  }, {
    start: -10,
    end: 10,
    step: '2',
  }, {
    end: -10,
    randomKey: 'abc',
  }, {}, 'abc', 132, NaN, true, null, undefined, {}].forEach((value) =>
    itRecognizesValueAsInvalid(value, rangeDataSpec)
  );

  ['', 'abc'].forEach((value) =>
    itRecognizesValueAsValid(value, stringDataSpec)
  );
  [132, NaN, true, null, undefined, {}].forEach((value) =>
    itRecognizesValueAsInvalid(value, stringDataSpec)
  );

  [{
    timestamp: 123,
    tsName: 'abc',
    value: 12,
  }, {
    timestamp: 123,
    tsName: 'abc',
    value: -12,
  }, {
    timestamp: 123,
    tsName: 'abc',
    value: 12.5,
  }].forEach((value) =>
    itRecognizesValueAsValid(value, timeSeriesMeasurementDataSpec)
  );
  [{
    timestamp: -123,
    tsName: 'abc',
    value: 12,
  }, {
    timestamp: 123.5,
    tsName: 'abc',
    value: 12,
  }, {
    timestamp: 123,
    tsName: '',
    value: 12,
  }, {
    tsName: 'abc',
    value: 12,
  }, {
    timestamp: 123,
    value: 12,
  }, {
    timestamp: 123,
    tsName: 'abc',
  }, {
    timestamp: '123',
    tsName: 'abc',
    value: 12,
  }, {
    timestamp: 123,
    tsName: 123,
    value: 12,
  }, {
    timestamp: 123,
    tsName: '123',
    value: '12',
  }, {
    timestamp: 123,
    tsName: 'abc',
    value: 12,
    someKey: 'xyz',
  }, {}, 'abc', 132, NaN, true, null, undefined, []].forEach((value) =>
    itRecognizesValueAsInvalid(value, timeSeriesMeasurementDataSpec)
  );
});

function itRecognizesValueAsValid(value, atmDataSpec) {
  it(`recognizes value ${stringifyValue(value)} as valid for data spec ${JSON.stringify(atmDataSpec)}`,
    function () {
      expect(validate(value, atmDataSpec)).to.be.true;
    }
  );
}

function itRecognizesValueAsInvalid(value, atmDataSpec) {
  it(`recognizes value ${stringifyValue(value)} as invalid for data spec ${JSON.stringify(atmDataSpec)}`,
    function () {
      expect(validate(value, atmDataSpec)).to.be.false;
    }
  );
}

function stringifyValue(value) {
  if (value === undefined) {
    return 'undefined';
  } else if (Number.isNaN(value)) {
    return 'NaN';
  } else {
    return JSON.stringify(value);
  }
}
