import SingleValuePresenter from './single-value-presenter';

export default SingleValuePresenter.extend({
  classNames: ['range-presenter'],

  /**
   * @override
   */
  dataSpec: Object.freeze({
    type: 'range',
  }),

  /**
   * @override
   */
  async fetchValueContainer() {
    if (!this.getStoreContentCallback) {
      return null;
    }

    const value = await this.getStoreContentCallback({
      type: 'rangeStoreContentBrowseOptions',
    });

    return { success: true, value };
  },
});
