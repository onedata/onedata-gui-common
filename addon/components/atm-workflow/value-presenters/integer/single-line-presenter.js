import SingleLinePresenterBase from '../commons/single-line-presenter-base';

export default SingleLinePresenterBase.extend({
  classNames: ['integer-single-line-presenter'],

  /**
   * @virtual
   * @type {number}
   */
  value: undefined,
});
