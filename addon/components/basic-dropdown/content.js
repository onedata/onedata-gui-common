/**
 * Extension of ember-basic-dropdown dropdown component
 * 
 * @module components/basic-dropdown/content
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Content from 'ember-basic-dropdown/components/basic-dropdown/content';

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

    return superResult;
  },
});
