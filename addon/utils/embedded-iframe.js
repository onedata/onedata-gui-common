/**
 * @typedef {Object} EmbeddedIframeOwner
 * @property {any} ownerReference
 * @property {HTMLElement} hostElement
 */

import EmberObject, { computed, get, observer } from '@ember/object';
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
   */
  iframeId: undefined,

  /**
   * @virtual
   * @type {Ember.A<EmbeddedIframeOwner>}
   */
  owners: undefined,

  /**
   * @virtual
   * @type {string}
   */
  src: undefined,

  /**
   * @virtual
   * @type {string}
   */
  iframeClass: '',

  /**
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
   * @type {Ember.ComputedProperty<EmbeddedIframeOwner>}
   */
  activeOwner: reads('owners.firstObject'),

  /**
   * @type {Document}
   */
  _document: document,

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
  callParentCallbacks: computed(function callParentCallbacks() {
    return {};
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  sharedProperties: computed(function sharedProperties() {
    return {};
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

  activeOwnerObserver: observer('activeOwner', function activeOwnerObserver() {
    this.recalculatePosition();
  }),

  srcObserver: observer('src', function srcObserver() {
    const {
      iframeElement,
      src,
    } = this.getProperties('iframeElement', 'src');

    iframeElement.src = src;
    safeExec(this, () => {
      this.setProperties({
        iframeIsLoading: true,
        iframeError: undefined,
      });
    });
  }),

  iframeClassObserver: observer(
    'iframeClass',
    'iframeIsLoading',
    'iframeError',
    'activeOwner.hostElement',
    function iframeClassObserver() {
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

      const classNames = ['embedded-iframe']
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
    this.iframeClassObserver();
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

  callParent(method, ...args) {
    const callParentCallbacks = this.get('callParentCallbacks');
    const callback = callParentCallbacks[method];
    if (typeof callback === 'function') {
      callback(...args);
    } else {
      throw new Error(
        `embedded-iframe: no such action: ${method}`
      );
    }
    return callParentCallbacks[method] 
  },

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
