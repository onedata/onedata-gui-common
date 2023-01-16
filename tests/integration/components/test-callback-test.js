import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | test callback', function () {
  setupRenderingTest();

  it('immediately invokes callback', async function () {
    const spy = sinon.spy();
    const callback = function (testCallbackComponent) {
      spy(testCallbackComponent.get('x'), testCallbackComponent.get('y'));
    };
    this.set('callback', callback);
    await render(hbs `
      {{test-callback callback=callback x=1 y=2}}
    `);
    expect(spy).to.be.calledOnce;
    expect(spy).to.be.calledWith(1, 2);
  });
});
