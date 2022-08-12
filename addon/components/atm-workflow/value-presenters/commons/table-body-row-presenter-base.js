import Component from '@ember/component';

export default Component.extend({
  tagName: 'tr',
  classNames: ['table-body-row-presenter'],
  attributeBindings: ['dataRowId:data-row-id'],

  /**
   * @virtual
   * @type {unknown}
   */
  value: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @virtual optional
   * @type {Array<string>}
   */
  columns: undefined,

  /**
   * Value for `data-row-id` attribute (used by infinite scroll).
   * @virtual optional
   * @type {string}
   */
  dataRowId: undefined,
});
