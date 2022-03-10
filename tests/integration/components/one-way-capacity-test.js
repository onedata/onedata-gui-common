import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, focus, blur, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';

class UnitSelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.one-way-capacity', '.ember-basic-dropdown-content');
  }
}

describe('Integration | Component | one way capacity', function () {
  setupRenderingTest();

  it('shows passed capacity', async function () {
    const capacity = 1024 * 1024;
    this.set('capacity', capacity);

    await render(hbs `{{one-way-capacity value=capacity}}`);

    expect(this.$('.size-number-input').val(), 'capacity number')
      .to.equal('1');
    expect(
      this.$('.ember-power-select-selected-item').text().trim(),
      'capacity unit'
    ).to.equal('MiB');
  });

  it('notifies about capacity number change', async function () {
    const capacity = 1024 * 1024;
    this.set('capacity', capacity);
    const changeSpy = sinon.spy();

    this.set('changed', changeSpy);
    await render(hbs `{{one-way-capacity value=capacity onChange=(action changed)}}`);

    await fillIn('.size-number-input', '2');
    expect(changeSpy).to.be.calledWith(String(2 * 1024 * 1024));
  });

  it('notifies about capacity unit change', async function () {
    const capacity = 1024 * 1024;
    this.set('capacity', capacity);
    const changeSpy = sinon.spy();

    this.set('changed', changeSpy);
    await render(hbs `{{one-way-capacity value=capacity onChange=(action changed)}}`);

    await new UnitSelectHelper().selectOption(2);
    expect(changeSpy).to.be.calledWith(String(1024 * 1024 * 1024));
  });

  it('notifies about focus lost', async function () {
    const focusOutSpy = sinon.spy();

    this.set('focusedOut', focusOutSpy);
    await render(hbs `{{one-way-capacity onFocusOut=(action focusedOut)}}`);

    await focus('.size-number-input');
    await blur('.size-number-input');
    expect(focusOutSpy).to.be.calledOnce;
  });

  it('notifies about key up', async function () {
    const keyUpSpy = sinon.spy();

    this.set('keyUp', keyUpSpy);
    await render(hbs `{{one-way-capacity value=capacity onKeyUp=(action keyUp)}}`);

    await triggerKeyEvent('.size-number-input', 'keyup', 'Enter');
    expect(keyUpSpy)
      .to.be.calledWith(sinon.match(event => event.key === 'Enter'));
  });
});
