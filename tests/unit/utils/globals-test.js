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
  nativeGlobals.forEach(([globalName, nativeGlobal], idx) => {
    const otherNativeGlobals = nativeGlobals
      .filter((elem) => elem !== nativeGlobals[idx]);

    it(`provides ${globalName} global`, function () {
      expect(globals[globalName]).to.equal(nativeGlobal);
    });

    it(`allows to mock ${globalName} global`, function () {
      const mock = { a: 1 };
      globals.mock(globalName, mock);
      mock.b = 2;

      Object.keys((propName) => {
        expect(globals[globalName][propName]).to.equal(mock[propName]);
        expect(globals[`native${_.upperFirst(globalName)}`][propName]).to.be.undefined;
      });
      otherNativeGlobals.forEach(([otherGlobalName, otherNativeGlobal]) => {
        expect(globals[otherGlobalName]).to.equal(otherNativeGlobal);
      });
    });

    it(`allows to unmock ${globalName} global only`, function () {
      const mock = { a: 1 };
      nativeGlobals.forEach(([anyGlobalName]) => {
        globals.mock(anyGlobalName, mock);
      });

      globals.unmock(globalName);

      expect(globals[globalName]).to.equal(nativeGlobal);
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

    nativeGlobals.forEach(([globalName, nativeGlobal]) => {
      expect(globals[globalName]).to.equal(nativeGlobal);
    });
  });
});
