import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';

export default SingleLinePresenterBase.extend({
  classNames: ['dataset-single-line-presenter'],

  /**
   * @virtual
   * @type {AtmDataset}
   */
  value: undefined,

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const rootFilePath = typeof this.value?.rootFilePath === 'string' ?
      this.value.rootFilePath : '';

    const pathElements = rootFilePath.split('/');
    const lastPathElement = pathElements[pathElements.length - 1];
    const formattedFileName = lastPathElement ? `"${lastPathElement}"` : '–';

    return `<Dataset ${formattedFileName}>`;
  }),
});
