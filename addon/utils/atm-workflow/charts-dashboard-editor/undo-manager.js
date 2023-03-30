/**
 * Allows to track history of operations and undo/redo them.
 *
 * How to use:
 * - register done actions by calling `addActionToHistory(action)`,
 * - when you want to undo latest action, call `undo()`. You can do it multiple
 *   time and undo manu operations,
 * - when you want to redo previousle undone action, call `redo()`. You can
 *   do as many times as `undo` method was called.
 * - if you have reach the beginning of operation history, `undo()` will do
 *   nothing. The same when you have reached the newest operation and called
 *   `redo()`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { lt, gt, raw } from 'ember-awesome-macros';

export default EmberObject.extend({
  /**
   * Contains a list of performed actions, latest first.
   * @private
   * @type {Array<Utils.Action>}
   */
  history: undefined,

  /**
   * Current position in history. 0 means that we are at "present" and nothing
   * has been undone. Any number > 0 means, that the first `positionInHistory`
   * actions from `history` has been undone.
   *
   * Undoing increases this counter, redoing decreases it. Any new incoming
   * action resets it back to 0.
   * @private
   * @type {number}
   */
  positionInHistory: 0,

  /**
   * @public
   * @type {ComputedProperty<boolean>}
   */
  canUndo: lt('positionInHistory', 'history.length'),

  /**
   * @public
   * @type {ComputedProperty<boolean>}
   */
  canRedo: gt('positionInHistory', raw(0)),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('history', []);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.history.forEach((action) => action.destroy());
      this.history.splice(0, this.history.length);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @param {Utils.Action} action
   * @returns {void}
   */
  addActionToHistory(action) {
    if (this.history.includes(action)) {
      // This action is already present in history. It may happen when action is
      // undone/redone (so it is executed again and tries to register into
      // history) or action is reused multiple times (e.g. action triggered
      // every letter typed into an input).
      return;
    }

    // If we are in the past (positionInHistory > 0) and new action arrives,
    // then invalidate all undone actions. It will never be possible to redo
    // them as we started a new history "branch".
    const historyToCutOff = this.history.slice(0, this.positionInHistory);
    historyToCutOff.forEach((action) => action.destroy());

    this.setProperties({
      history: [action, ...this.history.slice(this.positionInHistory)],
      positionInHistory: 0,
    });
  },

  /**
   * @public
   * @returns {void}
   */
  undo() {
    if (!this.canUndo) {
      return;
    }

    const actionToUndo = this.history[this.positionInHistory];
    if (actionToUndo) {
      actionToUndo.executeUndo();
      this.set('positionInHistory', this.positionInHistory + 1);
    }
  },

  /**
   * @public
   * @returns {void}
   */
  redo() {
    if (!this.canRedo) {
      return;
    }

    const actionToRedo = this.history[this.positionInHistory - 1];
    if (actionToRedo) {
      actionToRedo.execute();
      this.set('positionInHistory', this.positionInHistory - 1);
    }
  },
});
