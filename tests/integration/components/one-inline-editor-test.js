import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  fillIn,
  settled,
  find,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Promise } from 'rsvp';
import sinon from 'sinon';

describe('Integration | Component | one-inline-editor', function () {
  setupRenderingTest();

  it('renders value', async function () {
    const value = 'asdf';
    this.set('value', value);
    await render(hbs `{{one-inline-editor value=value}}`);

    expect(find('.one-label').textContent.trim()).to.equal(value);
  });

  it('shows input with value after text click', async function () {
    const value = 'asdf';
    this.set('value', value);
    await render(hbs `{{one-inline-editor value=value}}`);

    await click('.one-label');

    const input = find('input');
    expect(input).to.exist;
    expect(input.value).to.equal(value);
  });

  it('allows to cancel edition', async function () {
    const value = 'asdf';
    this.set('value', value);
    await render(hbs `{{one-inline-editor value=value}}`);

    await click('.one-label');
    await fillIn('input', 'anotherValue');
    await click('.cancel-icon');

    expect(find('.one-label').textContent.trim()).to.equal(value);
  });

  it('saves edited value', async function () {
    const value = 'asdf';
    this.set('value', value);
    let promiseResolve;
    const saveSpy = sinon.spy(() =>
      new Promise((resolve) => promiseResolve = resolve));
    this.set('save', saveSpy);
    await render(hbs `{{one-inline-editor value=value onSave=(action save)}}`);

    await click('.one-label');
    const newValue = 'anotherValue';
    await fillIn('input', 'anotherValue');
    await click('.save-icon');
    expect(saveSpy).to.be.calledOnce;
    expect(find('.spin-spinner-block')).to.exist;
    expect(find('input').disabled).to.be.true;

    this.set('value', newValue);
    promiseResolve();
    await settled();
    expect(find('.spin-spinner-block')).to.not.exist;
    expect(find('.one-label').textContent.trim()).to.equal(newValue);
  });

  it('sends onInputValueChanged action with current value', async function () {
    const value = 'asdf';
    this.set('value', value);
    const onInputChanged = sinon.spy();
    this.set('onInputValueChanged', onInputChanged);
    await render(hbs `{{one-inline-editor value=value onInputValueChanged=(action onInputValueChanged)}}`);

    await click('.one-label');
    await fillIn('input', 'anotherValue');

    expect(onInputChanged).to.be.calledTwice;
    expect(onInputChanged).to.be.calledWith('asdf');
    expect(onInputChanged).to.be.calledWith('anotherValue');
  });
});
