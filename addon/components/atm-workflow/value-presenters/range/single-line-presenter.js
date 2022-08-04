import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';

export default SingleLinePresenterBase.extend({
  classNames: ['range-single-line-presenter'],

  /**
   * @virtual
   * @type {AtmRange}
   */
  value: undefined,

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const start = typeof this.value?.start === 'number' ? this.value.start : 0;
    const end = typeof this.value?.end === 'number' ? this.value.end : 0;
    const step = typeof this.value?.step === 'number' ? this.value.step : 0;

    return `<Range ${start}:${end}:${step}>`;
  }),
});
