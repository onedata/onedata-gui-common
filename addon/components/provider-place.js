/**
 * A circle representing a provider on world map.
 * 
 * @module components/provider-place
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, observer, getProperties } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { A, isArray } from '@ember/array';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';

import layout from 'onedata-gui-common/templates/components/provider-place';

export default Component.extend({
  layout,
  classNames: ['provider-place'],
  classNameBindings: ['status'],

  /**
   * A provider model that will be represented on map
   * To inject.
   * @type {Onezone.ProviderDetails|Array<Onezone.ProviderDetails>}
   */
  provider: null,

  /**
   * Parent atlas component width
   * @type {number}
   */
  atlasWidth: 0,

  /**
   * @virtual optional
   * @type {string}
   */
  hint: undefined,

  /**
   * Scale factor for circle size
   * @type {number} 
   */
  circleSizeScale: 1,

  /**
   * Circle color
   * @type {string}
   */
  circleColor: undefined,

  /**
   * If true, drop is rendered after circle click
   * @type {boolean}
   */
  renderDrop: true,

  /**
   * Query string to filter providers.
   * @type {string}
   */
  query: '',

  /**
   * @type {Onezone.ProviderDetails}
   */
  selectedProvider: undefined,

  /**
   * @type {function}
   * @param {Onezone.ProviderDetails} provider
   * @return {undefined}
   */
  providerSelectedAction: () => {},

  /**
   * Array of providers
   * @type {Ember.ComputedProperty<Onezone.ProviderDetails>}
   */
  providersArray: computed('provider', function providersArray() {
    const provider = this.get('provider');
    return isArray(provider) ? A(provider) : A([provider]);
  }),

  /**
   * Filtered array of providers
   * @type {Ember.ComputedProperty<Onezone.ProviderDetails>}
   */
  filteredProvidersArray: computed('providersArray.[]', 'query', function filteredProvidersArray() {
    const {
      providersArray,
      query,
    } = this.getProperties('providersArray', 'query');
    return get(providersArray, 'length') > 1 ? providersArray
      .filter(provider => get(provider, 'name')
        .indexOf(query) !== -1) :
      providersArray;
  }),

  /**
   * Component mode: single or multi
   * @type {Ember.ComputedProperty<string>}
   */
  mode: computed('providersArray.length', function mode() {
    return this.get('providersArray.length') > 1 ? 'multi' : 'single';
  }),

  /**
   * Provider status
   * @type {computed.string}
   */
  status: computed('providersArray.@each.{status,isStatusValid}', function () {
    const providersArray = this.get('providersArray');
    const status = [];
    providersArray.forEach(provider => {
      const s = get(provider, 'isStatusValid') ? get(provider, 'status') :
        'offline';
      if (status.indexOf(s) === -1) {
        status.push(s);
      }
    });
    return status.length > 1 ? 'mixed' : status[0];
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  circleStyles: computed('circleColor', function () {
    const circleColor = this.get('circleColor');
    return htmlSafe(`color: ${circleColor}; border-color: ${circleColor};`);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  popoverPlacement: computed(
    'providersArray.[0].{latitude,longitude}',
    function popoverPlacement() {
      const {
        latitude,
        longitude,
      } = getProperties(
        this.get('providersArray').objectAt(0),
        'latitude',
        'longitude'
      );
      const hAlign = longitude > 0 ? 'left' : 'right';
      const vAlign = latitude > 45 ? 'bottom' : latitude > -45 ? undefined : 'top';
      return vAlign ? `${hAlign}-${vAlign}` : hAlign;
    }
  ),

  atlasWidthObserver: observer('atlasWidth', function () {
    this._recalculateSize();
  }),

  selectedProviderObserver: observer('selectedProvider', function () {
    const providerId = this.get('selectedProvider.id');
    next(() => {
      safeExec(this, () => {
        const providerElement = $(
          `[data-provider="${providerId}"].providers-place-list-item`
        );
        if (providerElement.length > 0) {
          providerElement[0].scrollIntoView();
        }
      });
    });
  }),

  init() {
    this._super(...arguments);
    if (!this.get('selectedProvider')) {
      this.set('selectedProvider', this.get('providersArray').objectAt(0));
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.selectedProviderObserver();
  },

  didRender() {
    this._super(...arguments);
    this._recalculateSize();
  },

  /**
   * Adjusts circle size to atlas width
   */
  _recalculateSize() {
    let {
      atlasWidth,
      circleSizeScale,
    } = this.getProperties('atlasWidth', 'circleSizeScale');
    let width = atlasWidth * 0.02 * circleSizeScale;

    this.$().find('.circle').css({
      fontSize: width * 0.75 + 'px',
      width: width + 'px',
      height: width + 'px',
    });
  },

  actions: {
    newQuery(query) {
      this.set('query', query);
    },
    selectProvider(provider) {
      this.get('providerSelectedAction')(provider);
    },
  },
});
