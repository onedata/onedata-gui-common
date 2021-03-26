/**
 * Extension of ember-basic-dropdown dropdown component
 *
 * @module components/basic-dropdown/content
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Content from 'ember-basic-dropdown/components/basic-dropdown/content';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Content.extend({
  /**
   * @override
   */
  open() {
    const superResult = this._super(...arguments);

    // Fixes scrolling of ember-power-select inside perfect-scroll
    const dropdownElement = this.get('dropdownElement');
    const dropdownListElement = dropdownElement
      .querySelector('.ember-power-select-options');
    if (dropdownListElement) {
      dropdownListElement.classList.add('ps-child');
    }

    // Fixes incorrect positioning of dropdown content due to some interference
    // with a page scrollbar.
    next(() => safeExec(this, () => {
      let reposition = this.get('dropdown.actions.reposition');
      if (this.get('dropdown.isOpen') && reposition) {
        reposition();
      }
    }));

    return superResult;
  },
});
