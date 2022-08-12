import Component from '@ember/component';

export default Component.extend({
  tagName: 'tr',
  classNames: ['table-header-row-presenter'],

  /**
   * @virtual optional
   * @type {Array<string>}
   */
  columns: undefined,
});
