// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

import { settled, click, focus } from '@ember/test-helpers';
import sinon from 'sinon';

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
    const useInternalClock = !clock;
    if (useInternalClock) {
      clock = this.createFakeClock();
    }
    clock.tick(this.pickerInitDelay);
    return settled().then(() => {
      if (useInternalClock) {
        clock.restore();
      }
    });
  }

  selectToday() {
    return this.openPicker()
      .then(() => click(document.querySelector('.datetime-picker .xdsoft_today')));
  }

  getPickerElement() {
    return document.querySelector('.xdsoft_datetimepicker');
  }

  createFakeClock() {
    return sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });
  }
}
