/**
 * A "table body row" group value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TableBodyRowPresenterBase from '../commons/table-body-row-presenter-base';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/group/table-body-row-presenter';
import { GroupDetails } from './visual-presenter';

export default TableBodyRowPresenterBase.extend({
  layout,

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
