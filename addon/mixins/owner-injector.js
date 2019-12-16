/**
 * Use this mixin in objects, that does not have information about Ember owner
 * and cannot resolve service injections on their own. Needs specified `ownerSource`
 * (usually whatever component or service), that hold a reference to the Ember owner.
 * 
 * @module mixins/owner-injector
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { observer } from '@ember/object';
import { getOwner } from '@ember/application';

export default Mixin.create({
  /**
   * Ember framework object, that contains information about owner.
   * @type {Object}
   * @virtual
   */
  ownerSource: undefined,

  ownerSourceObserver: observer('ownerSource', function ownerSourceObserver() {
    const ownerSource = this.get('ownerSource');

    if (ownerSource && !getOwner(this)) {
      const ownerInjection = getOwner(ownerSource).ownerInjection();
      this.setProperties(ownerInjection);
    }
  }),

  init() {
    this._super(...arguments);

    this.ownerSourceObserver();
  }
});
