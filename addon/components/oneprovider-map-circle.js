/**
 * Draws a Oneprovider map representation in form of colored circle. Scale can
 * be adjusted using properties `mapSize` and `scale`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/oneprovider-map-circle';
import { computed, get } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { gt, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import oneproviderPlaceSizes from 'onedata-gui-common/utils/oneprovider-place-sizes';

export default Component.extend(I18n, {
  layout,
  classNames: ['oneprovider-map-circle', 'circle'],
  classNameBindings: ['status', 'isSelected:selected'],
  attributeBindings: ['style'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneproviderMapCircle',

  /**
   * @virtual
   * @type {Oneprovider}
   */
  oneproviders: undefined,

  /**
   * @type {boolean}
   */
  isSelected: false,

  /**
   * @virtual
   * @type {string}
   */
  color: undefined,

  /**
   * Circle scale factor. Is a percentage of `mapSize`.
   * @virtual
   * @type {number}
   */
  scale: 2,

  /**
   * Map maximum size, that will be used with `scale` property to calculate
   * circle size.
   * @virtual
   * @type {number}
   */
  mapSize: 1000,

  /**
   * @type {boolean}
   */
  representsManyOneproviders: gt('oneproviders.length', raw(1)),

  /**
   * One of: 'online', 'offline', 'mixed'
   * @type {Ember.ComputedProperty<string>}
   */
  status: computed('oneproviders.@each.status', function status() {
    const uniqStatuses = this.get('oneproviders').mapBy('status').uniq();
    return get(uniqStatuses, 'length') > 1 ? 'mixed' : uniqStatuses[0];
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  style: computed('color', 'scale', 'mapSize', 'isSelected', function style() {
    const {
      color,
      scale,
      mapSize,
      isSelected,
    } = this.getProperties('color', 'scale', 'mapSize', 'isSelected');
    let styles = '';

    if (color) {
      styles += `color: ${color}; border-color: ${color}; `;
      if (isSelected) {
        styles += `background-color: ${color}; `;
      }
    }

    const {
      width,
      borderWidth,
      fontSize,
    } = oneproviderPlaceSizes(mapSize, scale);
    styles +=
      `border-width: ${borderWidth}px; font-size: ${fontSize}px; width: ${width}px; height: ${width}px;`;

    return htmlSafe(styles);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  hint: computed('oneproviders.length', function hint() {
    const oneprovidersCount = this.get('oneproviders.length');
    return oneprovidersCount === 1 ?
      get(this.get('oneproviders')[0], 'name') :
      this.t('nOneproviders', { n: oneprovidersCount });
  }),
});
