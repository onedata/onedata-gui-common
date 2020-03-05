import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { fillIn, focus, blur, keyEvent } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';

class UnitSelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.ember-basic-dropdown');
  }
}

describe('Integration | Component | one way capacity', function () {
  setupComponentTest('one-way-capacity', {
    integration: true,
  });

  it('shows passed capacity', function () {
    const capacity = 1024 * 1024;
    this.set('capacity', capacity);

    this.render(hbs `{{one-way-capacity value=capacity}}`);

    return wait()
      .then(() => {
        expect(this.$('.size-number-input').val(), 'capacity number')
          .to.equal('1');
        expect(
          this.$('.ember-power-select-selected-item').text().trim(),
          'capacity unit'
        ).to.equal('MiB');
      });
  });

  it('notifies about capacity number change', function () {
    const capacity = 1024 * 1024;
    this.set('capacity', capacity);
    const changeSpy = sinon.spy();

    this.on('changed', changeSpy);
    this.render(hbs `{{one-way-capacity value=capacity onChange=(action "changed")}}`);

    return wait()
      .then(() => fillIn('.size-number-input', '2'))
      .then(() => expect(changeSpy).to.be.calledWith(String(2 * 1024 * 1024)));
  });

  it('notifies about capacity unit change', function () {
    const capacity = 1024 * 1024;
    this.set('capacity', capacity);
    const changeSpy = sinon.spy();

    this.on('changed', changeSpy);
    this.render(hbs `{{one-way-capacity value=capacity onChange=(action "changed")}}`);

    return wait()
      .then(() => new UnitSelectHelper().selectOption(2))
      .then(() => expect(changeSpy).to.be.calledWith(String(1024 * 1024 * 1024)));
  });

  it('notifies about focus lost', function () {
    const focusOutSpy = sinon.spy();

    this.on('focusedOut', focusOutSpy);
    this.render(hbs `{{one-way-capacity onFocusOut=(action "focusedOut")}}`);

    return wait()
      .then(() => focus('.size-number-input'))
      .then(() => blur('.size-number-input'))
      .then(() => expect(focusOutSpy).to.be.calledOnce);
  });

  it('notifies about key up', function () {
    const keyUpSpy = sinon.spy();

    this.on('keyUp', keyUpSpy);
    this.render(hbs `{{one-way-capacity value=capacity onKeyUp=(action "keyUp")}}`);

    return wait()
      .then(() => keyEvent('.size-number-input', 'keyup', 13))
      .then(() => expect(keyUpSpy)
        .to.be.calledWith(sinon.match(event => event.keyCode === 13)));
  });
});
