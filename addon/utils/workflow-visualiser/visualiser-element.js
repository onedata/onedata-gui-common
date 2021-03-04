import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {String}
   */
  renderer: undefined,

  /**
   * One of: 'view', 'edit'
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {String}
   */
  type: undefined,

  /**
   * @virtual
   * @type {String}
   */
  id: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement|null}
   */
  parent: undefined,
});
