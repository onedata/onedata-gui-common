/**
 * An abstract base class for all actions. To execute concrete action, simply call
 * execute().
 *
 * @module utils/action
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default EmberObject.extend(I18n, {
  i18n: service(),

  /**
   * @virtual
   * @type {string}
   */
  title: undefined,

  /**
   * @virtual
   * Performs action
   */
  execute: notImplementedThrow,

  /**
   * @virtual optional
   * @type {string}
   */
  icon: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  tip: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  classNames: undefined,

  /**
   * @virtual optional
   * @type {any}
   * Action context. Can be used as a data source for execute().
   */
  context: null,

  /**
   * @type {Ember.ComputedProperty<Function>}
   * Callback ready to use inside hbs action helper
   */
  executeCallback: computed(function executeCallback() {
    return () => this.execute();
  }),

  // FIXME remove
  action: reads('executeCallback'),
});
