/**
 * Container object for iframe, that will be embedded into Onedata GUI
 * application. Allows injecting data and share actions.
 *
 * @module utils/embedded-iframe
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Each owner represents an entity, that uses embedded-iframe internally,
 * so it cannot be closed. There must be at least one owner
 * to consider embedded-iframe active. Otherwise it will be disposed by
 * the EmbeddedIframesManager service.
 * @typedef {Object} EmbeddedIframeOwner
 * @property {any} ownerReference
 * @property {HTMLElement} hostElement DOM element, which acts as a place for
 *   embedded iframe. Iframe will be placed behind this element and resized
 *   properly. It means that hostElement must passthrough all events to
 *   the iframe.
 */

import EmberObject, {
  computed,
  get,
  observer,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import {
  sharedObjectName,
  setSharedProperty,
  getSharedProperty,
  sharedDataPropertyName,
} from 'onedata-gui-common/utils/one-embedded-common';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { assert } from '@ember/debug';
import $ from 'jquery';

export default EmberObject.extend({
  guiUtils: service(),

  /**
   * @virtual
   * @type {string}
   * Iframe element id
   */
  iframeId: undefined,

  /**
   * @virtual
   * @type {Ember.A<EmbeddedIframeOwner>}
   * Array of owners of this iframe.
   */
  owners: undefined,

  /**
   * @virtual
   * @type {string}
   * Iframe src.
   */
  src: undefined,

  /**
   * @virtual
   * @type {string}
   */
  iframeClass: '',

  /**
   * A string that describes type/purpose of this iframe. It is optional and
   * has only informational sense. Usually it will describe application inside
   * iframe and/or location.
   * @virtual
   * @type {string}
   */
  iframeType: undefined,

  /**
   * Any data, that should be passed along with this iframe. Usually will be
   * correlated to iframeType.
   * @virtual
   * @type {any}
   */
  relatedData: undefined,

  /**
   * @type {boolean}
   */
  iframeIsLoading: true,

  /**
   * @type {any}
   */
  iframeError: undefined,

  /**
   * @type {Document}
   */
  _document: document,

  /**
   * @type {Ember.ComputedProperty<Object>}
   * Mapping actionName -> callback, that will be injected to iframe.
   */
  callParentCallbacks: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Object>}
   * Shared properties object, that will be injected to iframe.
   */
  sharedProperties: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<EmbeddedIframeOwner>}
   */
  activeOwner: reads('owners.firstObject'),

  /**
   * @type {HTMLIFrameElement}
   */
  iframeElement: computed(function iframeElement() {
    const {
      _document,
      iframeId,
      iframeOnLoadHandler,
    } = this.getProperties('_document', 'iframeId', 'iframeOnLoadHandler');

    const iframe = _document.createElement('iframe');
    iframe.id = iframeId;
    iframe.addEventListener('load', iframeOnLoadHandler);
    iframe[sharedObjectName] = {
      propertyChanged: notImplementedIgnore,
      callParent: this.callParent.bind(this),
      [sharedDataPropertyName]: {},
    };

    return iframe;
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  parentInfo: computed(
    'guiUtils.softwareVersionDetails',
    function parentInfo() {
      return {
        onezoneVersionDetails: this.get('guiUtils.softwareVersionDetails'),
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  iframeOnLoadHandler: computed(function iframeOnLoadHandler() {
    return (...args) => this.iframeOnLoad(...args);
  }),

  activeOwnerObserver: observer(
    'activeOwner.hostElement',
    function activeOwnerObserver() {
      // If owner changed, then hostElement also changed so the position of
      // the iframe must be calculated again.
      this.recalculatePosition();
    }
  ),

  srcObserver: observer('src', function srcObserver() {
    const {
      iframeElement,
      src,
    } = this.getProperties('iframeElement', 'src');

    const oldSrc = iframeElement.src;
    iframeElement.src = src;

    if (oldSrc) {
      // Do not set iframeIsLoading to true, because iframe may not notify onLoad event
      // and set it back to false (especially when part after "#" is changed)
      safeExec(this, () => {
        this.set('iframeError', undefined);
      });
    } else {
      safeExec(this, () => {
        this.setProperties({
          iframeIsLoading: true,
          iframeError: undefined,
        });
      });
    }
  }),

  iframeClassModifier: observer(
    'iframeClass',
    'iframeIsLoading',
    'iframeError',
    'activeOwner.hostElement',
    function iframeClassModifier() {
      const {
        iframeElement,
        iframeClass,
        iframeIsLoading,
        iframeError,
      } = this.getProperties(
        'iframeElement',
        'iframeClass',
        'iframeIsLoading',
        'iframeError'
      );
      const hostElement = this.get('activeOwner.hostElement');

      const classNames = ['embedded-iframe'];
      if (iframeClass) {
        classNames.push(iframeClass);
      }
      if (iframeIsLoading || iframeError || !hostElement) {
        classNames.push('hidden');
      }
      iframeElement.className = classNames.join(' ');
    }
  ),

  init() {
    this._super(...arguments);

    assert(
      'embedded-iframe: there must be at least one owner at creation time.',
      this.get('activeOwner') !== undefined
    );

    const {
      parentInfo,
    } = this.getProperties(
      'parentInfo',
      // get iframeElement to initiate it
      'iframeElement',
    );

    this.setSharedProperty('parentInfo', parentInfo);

    this.srcObserver();
    this.iframeClassModifier();
    this.activeOwnerObserver();
  },

  /**
   * @param {string} name
   * @returns {any}
   */
  getSharedProperty(name) {
    return getSharedProperty(this.get('iframeElement')[sharedObjectName], name);
  },

  /**
   * @param {string} name
   * @param {any} value
   * @returns {any}
   */
  setSharedProperty(name, value) {
    setSharedProperty(
      this.get('iframeElement')[sharedObjectName],
      name,
      value
    );
    this.notifySharedPropertyChanged(name);
    return value;
  },

  /**
   * @param {string} name
   * @returns {undefined}
   */
  notifySharedPropertyChanged(name) {
    this.get('iframeElement')[sharedObjectName].propertyChanged(name);
  },

  /**
   * @returns {undefined}
   */
  iframeOnLoad() {
    try {
      const iframeElement = this.get('iframeElement');

      // test for properly loaded iframe content - it should throw on security
      // error
      iframeElement.contentWindow;

      // attaching handler to intercept click events
      const pluginBody = iframeElement.contentDocument.body;
      // NOTE: this could be also resolved by setting rootEventType to 'click'
      // in ember-basic-dropdown 2.0, but our version of ember-power-select
      // uses version 1.1.2 and does not pass rootEvenType
      ['click', 'mousedown'].forEach(eventName => {
        pluginBody.addEventListener(eventName, (event) => {
          const newEvent = new event.constructor(event.type, event);
          iframeElement.dispatchEvent(newEvent);
        });
      });

      safeExec(this, () => {
        this.setProperties({
          iframeIsLoading: false,
          iframeError: undefined,
        });
      });
    } catch (error) {
      safeExec(this, () => {
        this.setProperties({
          iframeIsLoading: false,
          iframeError: error,
        });
      });
    }
  },

  /**
   * Calls action from callParentCallbacks according to iframe rpc data and
   * then returns the result back to the iframe.
   * @param {string} method
   * @param  {Array<any>} args
   * @returns {any}
   */
  callParent(method, ...args) {
    const callParentCallbacks = this.get('callParentCallbacks');
    const callback = callParentCallbacks[method];
    if (typeof callback === 'function') {
      return callback(...args);
    } else {
      throw new Error(
        `embedded-iframe: no such action: ${method}`
      );
    }
  },

  /**
   * Places iframe according to the position of active owner host element
   * (if specified).
   * @returns {undefined}
   */
  recalculatePosition() {
    const {
      iframeElement,
      activeOwner,
    } = this.getProperties('iframeElement', 'activeOwner');

    const $iframeElement = $(iframeElement);
    const hostElement = activeOwner && get(activeOwner, 'hostElement');
    if (hostElement) {
      const $hostElement = $(hostElement);
      const {
        top,
        left,
      } = $hostElement.offset();
      const height = $hostElement.innerHeight();
      const width = $hostElement.innerWidth();
      $iframeElement.css({
        top,
        left,
        width,
        height,
      });
    } else {
      $iframeElement
        .css({
          top: 'initial',
          left: 'initial',
        });
    }
  },
});
