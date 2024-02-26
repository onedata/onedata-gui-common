/**
 * Renders a tile with map of providers.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/providers-map-tile';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';

export default Component.extend(I18n, ProvidersColors, {
  layout,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.providersMapTile',

  /**
   * @virtual
   * @type {PromiseArray<Provider>}
   */
  providersProxy: null,

  /**
   * @virtual
   * @type {string|undefined}
   */
  aspect: undefined,

  /**
   * @virtual optional
   * @type {string|undefined}
   */
  customLink: undefined,

  /**
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  title: computed({
    get() {
      return this.injectedTitle ?? this.t('title');
    },
    set(key, value) {
      this.injectedTitle = value;
    },
  }),

  /**
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  moreText: computed({
    get() {
      return this.injectedMoreText ?? this.t('moreText');
    },
    set(key, value) {
      return this.injectedMoreText = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedTitle: null,

  /**
   * @type {string | null}
   */
  injectedMoreText: null,
});
