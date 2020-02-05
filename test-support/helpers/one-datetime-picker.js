import { click, focus } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';

export default class OneDatetimePickerHelper {
  constructor($trigger) {
    this.$trigger = $trigger;
    // 100 is a value used internally in picker plugin in setTimeout.
    // Cannot be changed (yet)
    this.pickerInitDelay = 150;
  }

  openPicker(viaFocus = false) {
    const clock = this.createFakeClock();
    return (viaFocus ? focus(this.$trigger[0]) : click(this.$trigger[0]))
      .then(() => this.waitForPickerInit(clock))
      .then(() => clock.restore());
  }

  waitForPickerInit(clock) {
    const useInternalClock = !clock;
    if (useInternalClock) {
      clock = this.createFakeClock();
    }
    clock.tick(this.pickerInitDelay);
    return wait().then(() => {
      if (useInternalClock) {
        clock.restore();
      }
    });
  }

  selectToday() {
    return this.openPicker()
      .then(() => click($('.datetime-picker .xdsoft_today')[0]));
  }

  getPickerElement() {
    return $('.xdsoft_datetimepicker');
  }

  createFakeClock() {
    return sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });
  }
}
