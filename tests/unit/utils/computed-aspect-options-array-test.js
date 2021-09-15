import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import computedAspectOptionsArray from 'onedata-gui-common/utils/computed-aspect-options-array';
import EmberObject, { get, set } from '@ember/object';
import sinon from 'sinon';

const NavigationState = EmberObject.extend({
  aspectOptions: undefined,
  changeRouteAspectOptions() {},
  init() {
    this.set('aspectOptions', {});
  },
});

describe('Unit | Utility | computed aspect options array', function () {
  beforeEach(function () {
    const navigationState = NavigationState.create();
    const testedClass = EmberObject.extend({
      hello: computedAspectOptionsArray('hello'),
    });
    const testedObject = testedClass.create({
      navigationState,
    });
    this.navigationState = navigationState;
    this.testedObject = testedObject;
  });

  it('returns empty array if aspect option property is null', async function () {
    return testServiceValueToComputedValue(this, null, []);
  });

  it('returns empty array if aspect option property is empty string', async function () {
    return testServiceValueToComputedValue(this, '', []);
  });

  it('returns empty array if aspect option property is undefined', async function () {
    return testServiceValueToComputedValue(this, undefined, []);
  });

  it('returns array of values for comma-separated string in aspact options', async function () {
    return testServiceValueToComputedValue(this, 'one,two,three', ['one', 'two', 'three']);
  });

  it('invokes changeRouteAspectOptions with comma-separated string when an array is set', async function () {
    const changeRouteAspectOptions =
      sinon.spy(this.navigationState, 'changeRouteAspectOptions');
    set(this.testedObject, 'hello', ['one', 'two', 'three']);

    expect(changeRouteAspectOptions)
      .to.have.been.calledWith(sinon.match({ hello: 'one,two,three' }));
  });

  it('invokes changeRouteAspectOptions with null when an empty array is set', async function () {
    const changeRouteAspectOptions =
      sinon.spy(this.navigationState, 'changeRouteAspectOptions');
    set(this.testedObject, 'hello', []);

    expect(changeRouteAspectOptions)
      .to.have.been.calledWith(sinon.match({ hello: null }));
  });

  it('invokes changeRouteAspectOptions with null when non-array is set', async function () {
    const changeRouteAspectOptions =
      sinon.spy(this.navigationState, 'changeRouteAspectOptions');
    set(this.testedObject, 'hello', 'world');

    expect(changeRouteAspectOptions)
      .to.have.been.calledWith(sinon.match({ hello: null }));
  });
});

function testServiceValueToComputedValue(testCase, navigationValue, computedValue) {
  set(testCase.navigationState, 'aspectOptions.hello', navigationValue);

  const value = get(testCase.testedObject, 'hello');

  expect(value).to.deep.equal(computedValue);
}
