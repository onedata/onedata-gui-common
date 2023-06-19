import { settled, click, focus } from '@ember/test-helpers';
import sinon from 'sinon';
import globals from 'onedata-gui-common/utils/globals';

export default class OneDatetimePickerHelper {
  constructor(trigger) {
    this.trigger = trigger;
    // 100 is a value used internally in picker plugin in setTimeout.
    // Cannot be changed (yet). Using 150 to be avoid race
    this.pickerInitDelay = 150;
  }

  openPicker(viaFocus = false) {
    const clock = this.createFakeClock();
    return (viaFocus ? focus(this.trigger) : click(this.trigger))
      .then(() => this.waitForPickerInit(clock))
      .then(() => clock.restore());
  }

  waitForPickerInit(clock) {
    const clockToUse = clock ?? this.createFakeClock();
    clockToUse.tick(this.pickerInitDelay);
    return settled().then(() => {
      if (!clock) {
        clockToUse.restore();
      }
    });
  }

  selectToday() {
    return this.openPicker()
      .then(() => click(globals.document.querySelector('.datetime-picker .xdsoft_today')));
  }

  getPickerElement() {
    return globals.document.querySelector('.xdsoft_datetimepicker');
  }

  createFakeClock() {
    return sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });
  }
}
