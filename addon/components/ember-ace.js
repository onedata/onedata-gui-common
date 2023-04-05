/**
 * An extension of ember-ace component (from ember-ace addon) which fixes bugs.
 * Fixed bugs:
 * 1. Bug description: When some event (like rendering another element next to
 *    the editor in a flex container) causes the editor to shrink, it does not
 *    recalculate it's height properly. Visually it's height is correct, but we
 *    can't scroll to the contents at the very bottom of the editor.
 *
 *    Bug solution: Additional resize observer on component root element,
 *    which - when fired - forces ACE editor to recalculate its size.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberAce from 'ember-ace/components/ember-ace';

export default EmberAce.extend({
  /**
   * @type {ResizeObserver | undefined}
   */
  resizeObserver: undefined,

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    if (this.element) {
      const resizeObserver = new ResizeObserver(() => {
        this.editor?.resize();
      });
      resizeObserver.observe(this.element);

      this.set('resizeObserver', resizeObserver);
    }
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.resizeObserver?.disconnect();
    } finally {
      this._super(...arguments);
    }
  },
});
