import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

export default SingleLinePresenterBase.extend({
  classNames: ['time-series-measurement-single-line-presenter'],

  /**
   * @virtual
   * @type {AtmRange}
   */
  value: undefined,

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const tsName = typeof this.value?.tsName === 'string' ?
      this.value.tsName : '';
    const timestamp = typeof this.value?.timestamp === 'number' ?
      this.value.timestamp : null;
    const value = typeof this.value?.value === 'number' ?
      this.value.value : null;

    const formattedTsName = tsName ? `"${tsName}"` : '–';
    const formattedTimestamp = timestamp !== null ?
      dateFormat([timestamp], { format: 'report' }) : '–';
    const formattedValue = value !== null ? String(value) : '–';

    return `<TSMeas. ${formattedTimestamp};${formattedTsName};${formattedValue}>`;
  }),
});
