/**
 * Shows query block adder with adder trigger.
 * 
 * @module components/query-builder/block-adder
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/query-builder/block-adder';
import { guidFor } from '@ember/object/internals';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';

export default Component.extend({
  tagName: '',
  layout,

  /**
   * @virtual
   * @type {Array<String>}
   */
  operators: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBlockAdd: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  refreshQueryProperties: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  disabled: false,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  hideConditionCreation: false,

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * @type {String}
   */
  popoverPlacement: 'vertical',

  /**
   * @type {PromiseObject}
   */
  refreshQueryPropertiesProxy: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  btnId: tag `btn-${'componentId'}`,

  /**
   * Id of main element of this component in template
   * @type {ComputedProperty<String>}
   */
  componentId: computed(function componentId() {
    return guidFor(this);
  }),

  init() {
    this._super(...arguments);
    this.set('refreshQueryPropertiesProxy', promiseObject(resolve()));
  },

  actions: {
    /**
     * 
     * @param {Function} closeSelectorCallback
     * @param {Utils.QueryBuilder.QueryBlock} selectedBlock
     */
    addBlock(closeSelectorCallback, selectedBlock) {
      closeSelectorCallback();
      this.get('onBlockAdd')(selectedBlock);
    },
    togglePopover(open) {
      let effOpen = open;
      if (typeof effOpen !== 'boolean') {
        effOpen = !this.get('popoverOpen');
      }
      if (effOpen && !this.get('hideConditionCreation')) {
        const promise = this.get('refreshQueryProperties')();
        if (promise && promise.then) {
          this.set('refreshQueryPropertiesProxy', promise);
        }
      }
      this.set('popoverOpen', effOpen);
    },
  },
});
