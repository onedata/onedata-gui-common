/**
 * Shows tag informing about revision state.
 *
 * @module components/revisions-table/state-tag
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/revisions-table/state-tag';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional, array, tag } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

// Known states configuration
const allowedStates = ['draft', 'stable', 'deprecated'];
const fallbackState = 'draft';
const stylesForStates = {
  draft: 'info',
  stable: 'success',
  deprecated: 'default',
};

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['revisions-table-state-tag', 'label'],
  classNameBindings: ['stateClass', 'styleClass'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable.stateTag',

  /**
   * For possible values see `allowedStates`
   * @virtual
   * @type {String}
   */
  state: undefined,

  /**
   * @type {Array<String>}
   */
  allowedStates,

  /**
   * @type {String}
   */
  fallbackState,

  /**
   * @type {Object}
   */
  stylesForStates,

  /**
   * @type {ComputedProperty<String>}
   */
  normalizedState: conditional(
    array.includes('allowedStates', 'state'),
    'state',
    'fallbackState'
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  stateClass: tag `state-${'normalizedState'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  styleClass: computed('normalizedState', 'stylesForStates', function styleClass() {
    const {
      normalizedState,
      stylesForStates,
    } = this.getProperties('normalizedState', 'stylesForStates');

    const style = stylesForStates[normalizedState];
    return `label-${style}`;
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  label: computed('normalizedState', function label() {
    return this.t(`states.${this.get('normalizedState')}`);
  }),
});
