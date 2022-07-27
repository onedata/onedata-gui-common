/**
 * Shows user log entry content. If it has `description` field, then it is shown
 * directly. Othwerwise the whole content is json-stringified and rendered.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/audit-log-presenter/user-log-content-cell';

export default Component.extend({
  layout,
  tagName: 'td',
  classNames: ['user-log-content-cell', 'truncate', 'font-monospace'],
  attributeBindings: ['colspan'],

  /**
   * @virtual
   * @type {unknown}
   */
  content: undefined,

  /**
   * @type {number}
   * @virtual
   */
  colspan: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedContent: computed('content', function stringifiedContent() {
    const content = this.get('content');
    const description = content?.description;

    if (typeof description === 'string' && description.trim()) {
      return description;
    } else if (typeof description === 'boolean' || typeof description === 'number') {
      return JSON.stringify(description);
    } else {
      return JSON.stringify(content);
    }
  }),
});
