/**
 * Custom extension of BsTab from Ember Bootstrap. Fixes some issues.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsTab from 'ember-bootstrap/components/bs-tab';
import { action } from '@ember/object';
import { classNames } from '@ember-decorators/component';

@classNames('one-bs-tab')
export default class OneBsTab extends BsTab {
  /**
   * Extending original class, because we need to patch internal actions.
   */
  '__ember-bootstrap_subclass' = true;

  /**
   * @override
   * Fixes changing URL hash (bug in Ember Bootstrap version 4.x).
   * https://github.com/ember-bootstrap/ember-bootstrap/issues/1673
   */
  @action
  select(id, event) {
    event?.preventDefault();
    return super.select(...arguments);
  }
}
