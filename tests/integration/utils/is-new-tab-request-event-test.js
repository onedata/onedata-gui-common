import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Component from '@ember/component';
import isNewTabRequestEvent from 'onedata-gui-common/utils/is-new-tab-request-event';
import { click, keyEvent } from 'ember-native-dom-helpers';

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
  setupComponentTest('is-new-tab-request-event', {
    integration: true,
  });

  beforeEach(function () {
    this.register('component:dummy-component', DummyComponent);
  });

  it('returns false for plain click', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.false;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    this.render(hbs `{{dummy-component myAction=myActionSpy}}`);
    await click(this.$('#btn')[0]);

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns true for click with ctrl', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.true;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    this.render(hbs `{{dummy-component myAction=myActionSpy}}`);
    await click(this.$('#btn')[0], { ctrlKey: true });

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns false for plain enter keydown', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.false;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    this.render(hbs `{{dummy-component myAction=myActionSpy}}`);

    await keyEvent(this.$('#btn')[0], 'keydown', 13, { key: 'Enter' });

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns false for plain enter keydown', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.true;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    this.render(hbs `{{dummy-component myAction=myActionSpy}}`);

    await keyEvent(this.$('#btn')[0], 'keydown', 13, {
      key: 'Enter',
      ctrlKey: true,
    });

    expect(myActionSpy).to.have.been.calledOnce;
  });

  it('returns true for middle click', async function () {
    const myAction = (event) => {
      expect(isNewTabRequestEvent(event)).to.be.true;
    };
    const myActionSpy = sinon.spy(myAction);
    this.set('myActionSpy', myActionSpy);

    this.render(hbs `{{dummy-component myAction=myActionSpy}}`);

    await click(this.$('#btn')[0], { button: 1, which: 2 });

    expect(myActionSpy).to.have.been.calledOnce;
  });
});
