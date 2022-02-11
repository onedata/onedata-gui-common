import { expect } from 'chai';
import { describe, it } from 'mocha';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';

describe('Unit | Utility | i18n/stringify duration', function () {
  testStringify('converts -1h', -3600, {}, 'an hour ago');
  testStringify('converts +1h', 3600, {}, 'in an hour');
  testStringify('converts -1h (short version)', -3600, { shortFormat: true }, '1 hr');
  testStringify('converts +1h (short version)', 3600, { shortFormat: true }, '1 hr');
  testStringify(
    'converts to generic "a few" counter for -2s',
    -2, {},
    'a few seconds ago'
  );
  testStringify(
    'converts to generic "a few" counter for 2s',
    2, {},
    'in a few seconds'
  );
  testStringify(
    'converts to generic "a few" counter for -2s (short version)',
    -2, { shortFormat: true },
    'a few sec'
  );
  testStringify(
    'converts to generic "a few" counter for 2s (short version)',
    2, { shortFormat: true },
    'a few sec'
  );
  testStringify(
    'converts -2s (short version with individual seconds)',
    -2, { shortFormat: true, showIndividualSeconds: true },
    '2 sec'
  );
  testStringify(
    'converts 2s (short version with individual seconds)',
    2, { shortFormat: true, showIndividualSeconds: true },
    '2 sec'
  );
  testStringify(
    'converts -2s (individual seconds)',
    -2, { showIndividualSeconds: true },
    '2 seconds ago'
  );
  testStringify(
    'converts 2s (individual seconds)',
    2, { showIndividualSeconds: true },
    'in 2 seconds'
  );
  testStringify(
    'converts -2d (days counter enabled)',
    -3600 * 24 * 2, { includeDaysCounter: true },
    '2 days ago'
  );
  testStringify(
    'converts -45d (days counter enabled)',
    -3600 * 24 * 45, { includeDaysCounter: true },
    'a month ago (45 days)'
  );
  testStringify(
    'converts 3y (days counter enabled)',
    3600 * 24 * 365 * 3, { includeDaysCounter: true },
    'in 3 years (1095 days)'
  );
  testStringify(
    'converts -45d (short version with days counter enabled)',
    -3600 * 24 * 45, { shortFormat: true, includeDaysCounter: true },
    '1 mo (45 days)'
  );
  testStringify(
    'converts 3y (short version with days counter enabled)',
    3600 * 24 * 365 * 3, { shortFormat: true, includeDaysCounter: true },
    '3 years (1095 days)'
  );
});

function testStringify(description, seconds, options = {}, expectedResult) {
  it(description, function () {
    const result = stringifyDuration(seconds, options);
    expect(result).to.equal(expectedResult);
  });
}
