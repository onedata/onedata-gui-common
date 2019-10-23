import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import $ from 'jquery';
import { resolve } from 'rsvp';

describe('Integration | Component | one datetime picker', function () {
  setupComponentTest('one-datetime-picker', {
    integration: true,
  });

  beforeEach(function () {
    this.set('clock', sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    }));
  });

  afterEach(function () {
    this.get('clock').restore();
  });

  it('has class "one-datetime-picker"', function () {
    this.render(hbs`{{one-datetime-picker}}`);

    expect(this.$('.one-datetime-picker')).to.exist;
  });

  it('does not render datetime picker before input click', function () {
    this.render(hbs`{{one-datetime-picker}}`);

    return waitForPickerInit(this)
      .then(() =>
        expect(getPicker()).to.not.exist
      );
  });

  it('does render datetime picker after input click', function () {
    this.render(hbs`{{one-datetime-picker}}`);

    return click('input')
      .then(() => waitForPickerInit(this))
      .then(() =>
        expect(getPicker()).to.exist
      );
  });

  it('adds "datetime-picker" class to datetime picker element', function () {
    this.render(hbs`{{one-datetime-picker}}`);

    return click('input')
      .then(() => waitForPickerInit(this))
      .then(() =>
        expect(getPicker()).to.have.class('datetime-picker')
      );
  });

  it('notifies about changed value through "onChange" action', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs`{{one-datetime-picker onChange=(action "change")}}`);

    return click('input')
      .then(() => waitForPickerInit(this))
      .then(() => {
        const dayCell = getPicker().find('[data-date="6"]')[0];
        return click(dayCell);
      })
      .then(() => {
        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy).to.be.calledWith(sinon.match.instanceOf(Date));
      });
  });

  it('has customizable input id', function () {
    const inputId = 'important-input';
    this.set('inputId', inputId);

    this.render(hbs`{{one-datetime-picker elementId=inputId}}`);

    expect(this.$('input#' + inputId)).to.exist;
  });
  
  it('can be disabled', function () {
    this.render(hbs`{{one-datetime-picker disabled=true}}`);

    expect(this.$('input[disabled]')).to.exist;
  });

  it('can have a placeholder', function () {
    const placeholderText = 'sth';
    this.set('placeholderText', placeholderText);

    this.render(hbs`{{one-datetime-picker placeholder=placeholderText}}`);

    expect(this.$('input').attr('placeholder')).to.equal(placeholderText);
  });
});

function waitForPickerInit(self) {
  self.get('clock').tick(100);
  return resolve();
}

function getPicker() {
  return $('.xdsoft_datetimepicker');
}
