/* eslint-disable no-restricted-globals */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import globals from 'onedata-gui-common/utils/globals';
import _ from 'lodash';

const nativeGlobals = [{
  name: 'window',
  global: window,
  exampleProperty: 'document',
}, {
  name: 'document',
  global: document,
  exampleProperty: 'body',
}, {
  name: 'location',
  global: location,
  exampleProperty: 'hostname',
}, {
  name: 'localStorage',
  global: localStorage,
  exampleProperty: 'length',
}, {
  name: 'sessionStorage',
  global: sessionStorage,
  exampleProperty: 'length',
}, {
  name: 'fetch',
  global: fetch,
}];

describe('Unit | Utility | globals', function () {
  nativeGlobals.forEach(({ name, global, exampleProperty }, idx) => {
    const otherNativeGlobals = nativeGlobals
      .filter((elem) => elem !== nativeGlobals[idx]);

    it(`provides ${name} global`, function () {
      expectIsNative(name, globals[name]);
    });

    it(`allows to mock ${name} global`, function () {
      const mock = { a: 1 };
      globals.mock(name, mock);
      mock.b = 2;

      Object.keys(mock).forEach((propName) => {
        expect(globals[name][propName]).to.equal(mock[propName]);
        expect(globals[`native${_.upperFirst(name)}`][propName]).to.be.undefined;
        if (exampleProperty) {
          expect(globals[name][exampleProperty]).to.equal(global[exampleProperty]);
        }
      });
      otherNativeGlobals.forEach(({ name: otherName }) => {
        expectIsNative(otherName, globals[otherName]);
      });
    });

    it(`allows to unmock ${name} global only`, function () {
      const mock = { a: 1 };
      nativeGlobals.forEach(({ name: anyName }) => {
        globals.mock(anyName, mock);
      });

      globals.unmock(name);

      expectIsNative(name, globals[name]);
      otherNativeGlobals.forEach(({ name: otherName }) => {
        expect(globals[otherName].a).to.equal(1);
      });
    });
  });

  it('allows to unmock all globals', function () {
    const mock = {};
    nativeGlobals.forEach(({ name }) => {
      globals.mock(name, mock);
    });

    globals.unmock();

    nativeGlobals.forEach(({ name }) => {
      expectIsNative(name, globals[name]);
    });
  });
});

function expectIsNative(globalName, varToCheck) {
  const { global } = nativeGlobals.find(({ name }) => name === globalName);
  if (typeof global === 'function') {
    expect(varToCheck.name).to.equal(`bound ${global.name}`);
  } else {
    expect(varToCheck).to.equal(global);
  }
}
