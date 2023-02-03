import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  fillIn,
  settled,
  find,
  findAll,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Promise } from 'rsvp';
import sinon from 'sinon';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | one inline editor', function () {
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

  it('has save button disabled if isSaveDisabled flag is true', async function () {
    const value = 'asdf';
    const saveSpy = sinon.spy();
    this.setProperties({
      value,
      save: saveSpy,
    });

    await render(hbs`{{one-inline-editor
      value=value
      isSaveDisabled=true
      onSave=(action save)
    }}`);
    await click('.one-label');
    await fillIn('input', 'another value');

    expect(find('.save-icon')).to.have.class('disabled');
    await click('.save-icon');
    expect(saveSpy).to.have.not.been.called;
  });

  it('has tooltip on save button hover if saveButtonTip is set', async function () {
    this.setProperties({
      value: 'asfg',
    });

    await render(hbs`{{one-inline-editor
      value=value
      saveButtonTip="foo bar"
    }}`);
    await click('.one-label');
    const tooltip = new OneTooltipHelper('.save-icon');

    expect(await tooltip.getText()).to.contain('foo bar');
  });

  it('renders tags with icon and text for "tags" editorType', async function () {
    this.set('value', [
      { icon: 'space', label: 'hello' },
      { icon: 'provider', label: 'world' },
    ]);

    await render(hbs`{{one-inline-editor value=value editorType="tags"}}`);

    const tagItems = findAll('.tag-item');
    expect(tagItems[0]).to.contain.text('hello');
    expect(tagItems[1]).to.contain.text('world');
    expect(tagItems[0].querySelector('.oneicon-space')).to.exist;
    expect(tagItems[1].querySelector('.oneicon-provider')).to.exist;
  });
});
