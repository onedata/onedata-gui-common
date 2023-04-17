/* eslint-disable no-restricted-globals */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import globals from 'onedata-gui-common/utils/globals';
import _ from 'lodash';

const nativeGlobals = [
  ['window', window],
  ['document', document],
  ['location', location],
  ['localStorage', localStorage],
  ['sessionStorage', sessionStorage],
  ['fetch', fetch],
];

describe('Unit | Utility | globals', function () {
  nativeGlobals.forEach(([globalName], idx) => {
    const otherNativeGlobals = nativeGlobals
      .filter((elem) => elem !== nativeGlobals[idx]);

    it(`provides ${globalName} global`, function () {
      expectIsNative(globalName, globals[globalName]);
    });

    it(`allows to mock ${globalName} global`, function () {
      const mock = { a: 1 };
      globals.mock(globalName, mock);
      mock.b = 2;

      Object.keys((propName) => {
        expect(globals[globalName][propName]).to.equal(mock[propName]);
        expect(globals[`native${_.upperFirst(globalName)}`][propName]).to.be.undefined;
      });
      otherNativeGlobals.forEach(([otherGlobalName]) => {
        expectIsNative(otherGlobalName, globals[otherGlobalName]);
      });
    });

    it(`allows to unmock ${globalName} global only`, function () {
      const mock = { a: 1 };
      nativeGlobals.forEach(([anyGlobalName]) => {
        globals.mock(anyGlobalName, mock);
      });

      globals.unmock(globalName);

      expectIsNative(globalName, globals[globalName]);
      otherNativeGlobals.forEach(([otherGlobalName]) => {
        expect(globals[otherGlobalName].a).to.equal(1);
      });
    });
  });

  it('allows to unmock all globals', function () {
    const mock = {};
    nativeGlobals.forEach(([globalName]) => {
      globals.mock(globalName, mock);
    });

    globals.unmock();

    nativeGlobals.forEach(([globalName]) => {
      expectIsNative(globalName, globals[globalName]);
    });
  });
});

function expectIsNative(globalName, varToCheck) {
  const [, nativeGlobal] = nativeGlobals.find(([name]) => name === globalName);
  if (typeof nativeGlobal === 'function') {
    expect(varToCheck.name).to.equal(`bound ${nativeGlobal.name}`);
  } else {
    expect(varToCheck).to.equal(nativeGlobal);
  }
}
