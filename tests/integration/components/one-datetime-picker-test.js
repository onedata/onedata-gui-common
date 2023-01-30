import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import OneDatetimePickerHelper from '../../helpers/one-datetime-picker';

describe('Integration | Component | one datetime picker', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    // Some tests use fake clocks. We need to restore system clock
    const clock = this.get('clock');
    if (clock) {
      clock.restore();
    }
  });

  it('has class "one-datetime-picker"', async function () {
    await render(hbs `{{one-datetime-picker}}`);

    expect(find('.one-datetime-picker')).to.exist;
  });

  it('does not render datetime picker before input click', async function () {
    const clock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });
    this.set('clock', clock);

    await render(hbs `{{one-datetime-picker}}`);

    const pickerHelper = new OneDatetimePickerHelper(find('input'));
    return pickerHelper.waitForPickerInit(clock)
      .then(() =>
        expect(pickerHelper.getPickerElement()).to.not.exist
      );
  });

  it('does render datetime picker after input click', async function () {
    await render(hbs `{{one-datetime-picker}}`);

    const pickerHelper = new OneDatetimePickerHelper(find('input'));
    return pickerHelper.openPicker()
      .then(() =>
        expect(pickerHelper.getPickerElement()).to.exist
      );
  });

  it('adds "datetime-picker" class to datetime picker element', async function () {
    await render(hbs `{{one-datetime-picker}}`);

    const pickerHelper = new OneDatetimePickerHelper(find('input'));
    return pickerHelper.openPicker()
      .then(() =>
        expect(pickerHelper.getPickerElement()).to.have.class('datetime-picker')
      );
  });

  it('notifies about changed value through "onChange" action', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `{{one-datetime-picker onChange=(action change)}}`);

    const pickerHelper = new OneDatetimePickerHelper(find('input'));
    return pickerHelper.selectToday()
      .then(() => {
        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy).to.be.calledWith(sinon.match.instanceOf(Date));
      });
  });

  it('can be disabled', async function () {
    await render(hbs `{{one-datetime-picker disabled=true}}`);

    expect(find('input[disabled]')).to.exist;
    const pickerHelper = new OneDatetimePickerHelper(find('input'));
    return pickerHelper.openPicker()
      .then(() =>
        expect(pickerHelper.getPickerElement()).to.not.exist
      );
  });

  it('can have a placeholder', async function () {
    const placeholderText = 'sth';
    this.set('placeholderText', placeholderText);

    await render(hbs `{{one-datetime-picker placeholder=placeholderText}}`);

    expect(find('input').placeholder).to.equal(placeholderText);
  });
});
