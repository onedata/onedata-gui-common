/**
 * A "visual" group value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualPresenterBase from '../commons/visual-presenter-base';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/group/visual-presenter';
import recordIcon, { subtypeIconGetters } from 'onedata-gui-common/utils/record-icon';
import { translateGroupType } from 'onedata-gui-common/utils/group';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

export default VisualPresenterBase.extend({
  layout,
  classNames: ['details-with-icon'],

  /**
   * @override
   */
  dataSpecType: 'group',

  /**
   * @type {ComputedProperty<GroupDetails>}
   */
  groupDetails: computed('value', 'context', function groupDetails() {
    return GroupDetails.create({ group: this.value, context: this.context });
  }),

  /**
   * @type {ComputedProperty<string|null>}
   */
  name: reads('groupDetails.name'),

  /**
   * @type {ComputedProperty<string>}
   */
  icon: reads('groupDetails.icon'),

  /**
   * @type {ComputedProperty<SafeString | string>}
   */
  readableType: reads('groupDetails.readableType'),

  /**
   * @type {ComputedProperty<PromiseObject<string | null>>}
   */
  urlProxy: reads('groupDetails.urlProxy'),
});

export const GroupDetails = EmberObject.extend({
  /**
   * @virtual
   * @type {AtmGroup}
   */
  group: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<string | null>}
   */
  name: computed('group.name', 'groupWithDetailsProxy.content.name', function name() {
    return this.group?.name ?? this.groupWithDetailsProxy?.content?.name ?? null;
  }),

  /**
   * @public
   * @type {ComputedProperty<SafeString | string>}
   */
  readableType: computed(
    'group.type',
    'groupWithDetailsProxy.content.type',
    function readableType() {
      return translateGroupType(this.group?.type ??
          this.groupWithDetailsProxy?.content?.type) ??
        '—';
    }
  ),

  /**
   * @public
   * @type {ComputedProperty<string>}
   */
  icon: computed(
    'group',
    'groupWithDetailsProxy.content',
    function icon() {
      const group = this.groupWithDetailsProxy.content ?? this.group;
      return subtypeIconGetters.group(group) ?? recordIcon('group');
    }
  ),

  /**
   * @public
   * @type {ComputedProperty<PromiseObject<string | null>>}
   */
  urlProxy: computed('group.groupId', 'context', function urlProxy() {
    return promiseObject((async () => {
      if (!this.group?.groupId) {
        return null;
      }

      return (await this.context?.getGroupUrlById?.(this.group.groupId)) ?? null;
    })());
  }),

  /**
   * @private
   * @type {PromiseObject<AtmGroup | null>}
   */
  groupWithDetailsProxy: computed(
    'group',
    'context',
    function groupWithDetailsProxy() {
      return promiseObject((async () => {
        if (
          this.group?.groupId &&
          !this.group.name &&
          this.context?.getGroupDetailsById
        ) {
          try {
            return (await this.context.getGroupDetailsById(this.group.groupId)) ??
              this.group;
          } catch {
            return this.group;
          }
        } else {
          return this.group;
        }
      })());
    }
  ),
});
