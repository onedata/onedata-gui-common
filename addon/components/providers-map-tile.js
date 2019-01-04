/**
 * Renders a tile with map of providers.
 * 
 * @module components/providers-map-tile
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
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
   * @type {PromiseArray<Provider>}
   */
  providersProxy: null,
});
