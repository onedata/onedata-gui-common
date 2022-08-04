import SingleLinePresenterBase from '../commons/single-line-presenter-base';

export default SingleLinePresenterBase.extend({
  classNames: ['string-single-line-presenter'],

  /**
   * @virtual
   * @type {string}
   */
  value: undefined,
});
