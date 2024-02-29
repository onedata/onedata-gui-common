/**
 * Internal class used to manage modal instances by modal-manager service.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { Promise } from 'rsvp';
import { conditional, tag, raw } from 'ember-awesome-macros';

/**
 * @typedef {Object} ModalInstanceApi
 * @property {(data: unknown) => void} submit
 * @property {() => void} close
 */

export default EmberObject.extend({
  /**
   * @virtual
   * @type {String}
   */
  componentName: undefined,

  /**
   * @virtual
   * @type {ModalInstanceApi}
   */
  api: undefined,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  isOpened: false,

  /**
   * @virtual optional
   * @type {Object}
   */
  options: undefined,

  /**
   * Resolves `shownPromise`
   * @virtual optional
   * @type {Function}
   */
  resolveShownPromise: undefined,

  /**
   * Resolves when modal is fully visible
   * @virtual optional
   * @type {Promise}
   */
  shownPromise: undefined,

  /**
   * Resolves `hiddenPromise`
   * @virtual optional
   * @type {Function}
   */
  resolveHiddenPromise: undefined,

  /**
   * Resolves when modal is completly hidden
   * @virtual optional
   * @type {Promise}
   */
  hiddenPromise: undefined,

  /**
   * @type {ComputedProperty<String|null>}
   */
  fullComponentName: conditional(
    'componentName',
    tag `modals/${'componentName'}`,
    raw(null)
  ),

  init() {
    const {
      id,
      resolveShownPromise,
      shownPromise,
      resolveHiddenPromise,
      hiddenPromise,
    } = this.getProperties(
      'id',
      'resolveShownPromise',
      'shownPromise',
      'resolveHiddenPromise',
      'hiddenPromise'
    );

    if (!id) {
      this.set('id', guidFor(this));
    }
    if (!resolveShownPromise || !shownPromise) {
      this.set('shownPromise', new Promise(shownResolve =>
        this.set('resolveShownPromise', shownResolve)
      ));
    }
    if (!resolveHiddenPromise || !hiddenPromise) {
      this.set('hiddenPromise', new Promise(hiddenResolve =>
        this.set('resolveHiddenPromise', hiddenResolve)
      ));
    }
  },
});
