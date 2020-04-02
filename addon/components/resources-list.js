/**
 * A generic component for showing resources list. For now it only shows names, without more
 * contextual content.
 *
 * @module components/resources-list
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { array } from 'ember-awesome-macros';
import layout from '../templates/components/resources-list';

export const ResourceListItem = EmberObject.extend({
  /**
   * Item label. Should be specified even when conflictingLabelSource is
   * defined to allow sorting.
   * @virtual
   * @type {String}
   */
  label: undefined,

  /**
   * It takes precedence over label property. Should be an object with properties
   * needed to show conflicting labels.
   * @virtual
   * @type {String}
   */
  conflictingLabelSource: undefined,

  /**
   * @virtual
   * @type {String}
   */
  icon: undefined,

  /**
   * @virtual
   * @type {Array<Utils.Action>}
   */
  actions: computed(() => []),
});

export default Component.extend({
  layout,
  classNames: ['resources-list'],

  /**
   * @virtual
   * @type {Array<ResourceListItem>}
   */
  items: computed(() => []),

  /**
   * @type {ComputedProperty<Array<ResourceListItem>>}
   */
  sortedItems: array.sort('items', ['label']),
});
