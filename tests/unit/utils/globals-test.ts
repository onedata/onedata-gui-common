/* eslint-disable no-restricted-globals */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import globals, { GlobalName } from 'onedata-gui-common/utils/globals';
import _ from 'lodash';

const nativeGlobals = [{
  name: GlobalName.Window,
  global: window,
  exampleProperty: 'document',
}, {
  name: GlobalName.Document,
  global: document,
  exampleProperty: 'body',
}, {
  name: GlobalName.Location,
  global: location,
  exampleProperty: 'hostname',
}, {
  name: GlobalName.LocalStorage,
  global: localStorage,
  exampleProperty: 'length',
}, {
  name: GlobalName.SessionStorage,
  global: sessionStorage,
  exampleProperty: 'length',
}, {
  name: GlobalName.Fetch,
  global: fetch,
  exampleProperty: undefined,
}] as const;

describe('Unit | Utility | globals', function () {
  nativeGlobals.forEach(({ name, global, exampleProperty }, idx) => {
    const otherNativeGlobals = nativeGlobals
      .filter((elem) => elem !== nativeGlobals[idx]);

    it(`provides ${name} global`, function () {
      expectIsNative(name, globals[name]);
    });

    it(`allows to mock ${name} global`, function () {
      const mock: Record<string, unknown> = { a: 1 };
      globals.mock(name, mock);
      mock['b'] = 2;

      Object.keys(mock).forEach((propName) => {
        const globalToCheck = globals[name];
        const nativeGlobalToCheck = globals[
          `native${_.upperFirst(name)}` as keyof typeof globals
        ] as typeof window[GlobalName];
        expect(globalToCheck[propName as keyof typeof globalToCheck])
          .to.equal(mock[propName as keyof typeof mock]);
        expect(nativeGlobalToCheck[propName as keyof typeof nativeGlobalToCheck])
          .to.be.undefined;
        if (exampleProperty) {
          expect(globalToCheck[exampleProperty as keyof typeof globalToCheck])
            .to.equal(global[exampleProperty as keyof typeof global]);
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
        const globalToCheck = globals[otherName];
        expect(globalToCheck['a' as keyof typeof globalToCheck]).to.equal(1);
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

function expectIsNative(globalName: GlobalName, varToCheck: Function | unknown) {
  const global = nativeGlobals.find(({ name }) => name === globalName)?.global;
  if (typeof global === 'function' && typeof varToCheck === 'function') {
    expect(varToCheck.name).to.equal(`bound ${global.name}`);
  } else {
    expect(varToCheck).to.equal(global);
  }
}
