import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Helper | invoke-on-key', function () {
  setupRenderingTest();

  it('does not call any function when no key event happened', async function () {
    const enterSpy = this.set('enterSpy', sinon.spy());

    await render(hbs`<input
      onkeydown={{invoke-on-key (hash Enter=enterSpy)}}
    />`);

    expect(enterSpy).to.be.not.called;
  });

  it('calls a function associated with a pressed key', async function () {
    const {
      enterSpy,
      escapeSpy,
    } = this.setProperties({ enterSpy: sinon.spy(), escapeSpy: sinon.spy() });
    await render(hbs`<input
      onkeydown={{invoke-on-key (hash Enter=enterSpy Escape=escapeSpy)}}
    />`);

    await triggerKeyEvent('input', 'keydown', 'Enter');

    expect(enterSpy).to.be.calledOnce;
    expect(escapeSpy).to.be.not.called;
  });
});
