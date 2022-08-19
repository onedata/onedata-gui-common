import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';

export default SingleLinePresenterBase.extend({
  classNames: ['file-single-line-presenter'],

  /**
   * @virtual
   * @type {AtmFile}
   */
  value: undefined,

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const fileName = typeof this.value?.name === 'string' ? this.value.name : '';
    const formattedFileName = fileName ? `"${fileName}"` : '–';

    return `[File ${formattedFileName}]`;
  }),
});
