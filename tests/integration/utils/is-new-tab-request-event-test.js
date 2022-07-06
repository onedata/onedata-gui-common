import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Component from '@ember/component';
import isNewTabRequestEvent from 'onedata-gui-common/utils/is-new-tab-request-event';

const DummyComponent = Component.extend({
  layout: hbs `<button
    id="btn"
    onclick={{action myAction}}
    onkeydown={{action myAction}}
  >
      btn
  </button>`,
});

describe('Integration | Mixin | is new tab request event', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.owner.register('component:dummy-component', DummyComponent);
  });

  it('returns false for plain click', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.false;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    await render(hbs `{{dummy-component myAction=myActionSpy}}`);
    await click('#btn');

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns true for click with ctrl', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.true;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    await render(hbs `{{dummy-component myAction=myActionSpy}}`);
    await click('#btn', { ctrlKey: true });

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns false for plain enter keydown', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.false;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    await render(hbs `{{dummy-component myAction=myActionSpy}}`);

    await triggerKeyEvent('#btn', 'keydown', 13, { key: 'Enter' });

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns true for middle click', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.true;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    await render(hbs `{{dummy-component myAction=myActionSpy}}`);

    await click('#btn', { button: 1, which: 2 });

    expect(myActionSpy).to.have.been.calledOnce;
  });
});
