import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';

describe('Integration | Helper | invoke on enter', function () {
  setupRenderingTest();

  it('invokes action once on enter press', async function () {
    const spy = sinon.spy();
    this.set('myAction', spy);
    await render(hbs `
      <input
        id="invoke-on-enter-input"
        onkeydown={{invoke-on-enter (action myAction 1 2 3)}}
      >
    `);

    const e = $.Event('keydown');
    e.keyCode = 13;
    this.$('#invoke-on-enter-input').trigger(e);

    return wait().then(() => {
      expect(spy).to.be.calledOnce;
      expect(spy).to.be.calledWith(1, 2, 3);
    });
  });
});
