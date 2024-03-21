import { expect } from 'chai';
import { describe, it } from 'mocha';
import UndoManager from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor/undo-manager';
import { ActionUndoPossibility } from 'onedata-gui-common/utils/action';

describe('Unit | Utility | atm-workflow/chart-dashboard-editor/undo-manager', function () {
  it('has nothing to undo and redo at the beginning', function () {
    const manager = UndoManager.create();

    expectUndoRedo(manager, false, false);
  });

  it('has someting to undo when reversible action has been added', function () {
    const manager = UndoManager.create();

    manager.addActionToHistory(new FakeAction('1'));

    expectUndoRedo(manager, true, false);
  });

  it('has someting to redo when reversible action has been added and then undone', function () {
    const manager = UndoManager.create();

    manager.addActionToHistory(new FakeAction('1'));
    manager.undo();

    expectUndoRedo(manager, false, true);
  });

  it('allows to undo many actions up to the beginning of history', function () {
    const tracking = [];
    const manager = UndoManager.create();

    manager.addActionToHistory(new FakeAction('1', tracking));
    manager.addActionToHistory(new FakeAction('2', tracking));
    manager.addActionToHistory(new FakeAction('3', tracking));

    expectUndoRedo(manager, true, false);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.undo();
    expectUndoRedo(manager, false, true);
    expect(tracking).to.deep.equal([
      'undo-3',
      'undo-2',
      'undo-1',
    ]);
  });

  it('allows to redo many actions up to the current history', function () {
    const tracking = [];
    const manager = UndoManager.create();

    manager.addActionToHistory(new FakeAction('1', tracking));
    manager.addActionToHistory(new FakeAction('2', tracking));
    manager.addActionToHistory(new FakeAction('3', tracking));
    manager.undo();
    manager.undo();
    manager.undo();

    expectUndoRedo(manager, false, true);
    manager.redo();
    expectUndoRedo(manager, true, true);
    manager.redo();
    expectUndoRedo(manager, true, true);
    manager.redo();
    expectUndoRedo(manager, true, false);
    expect(tracking).to.deep.equal([
      'undo-3',
      'undo-2',
      'undo-1',
      'redo-1',
      'redo-2',
      'redo-3',
    ]);
  });

  it('allows to both undo and redo', function () {
    const tracking = [];
    const manager = UndoManager.create();

    manager.addActionToHistory(new FakeAction('1', tracking));
    manager.addActionToHistory(new FakeAction('2', tracking));
    manager.addActionToHistory(new FakeAction('3', tracking));

    expectUndoRedo(manager, true, false);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.redo();
    expectUndoRedo(manager, true, false);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.redo();
    expectUndoRedo(manager, true, true);
    expect(tracking).to.deep.equal([
      'undo-3',
      'redo-3',
      'undo-3',
      'undo-2',
      'redo-2',
    ]);
  });

  it('discards undone actions when new action has been added', function () {
    const tracking = [];
    const manager = UndoManager.create();

    manager.addActionToHistory(new FakeAction('1', tracking));
    manager.addActionToHistory(new FakeAction('2', tracking));
    manager.addActionToHistory(new FakeAction('3', tracking));

    expectUndoRedo(manager, true, false);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.addActionToHistory(new FakeAction('4', tracking));
    expectUndoRedo(manager, true, false);
    manager.redo();
    expectUndoRedo(manager, true, false);
    manager.undo();
    expectUndoRedo(manager, true, true);
    manager.redo();
    expectUndoRedo(manager, true, false);
    expect(tracking).to.deep.equal([
      'undo-3',
      'undo-4',
      'redo-4',
    ]);
  });

  it('ignores actions with "undoPossibility" equal to "notApplicable"', function () {
    const tracking = [];
    const manager = UndoManager.create();
    manager.addActionToHistory(new FakeAction('1', tracking));
    manager.addActionToHistory(new FakeAction('2', tracking));
    manager.undo();

    manager.addActionToHistory(
      new FakeAction('3', tracking, ActionUndoPossibility.NotApplicable)
    );

    expect(tracking).to.deep.equal(['undo-2']);
    expectUndoRedo(manager, true, true);
    manager.undo();
    expect(tracking).to.deep.equal(['undo-2', 'undo-1']);
    expectUndoRedo(manager, false, true);
    manager.redo();
    manager.redo();
    expect(tracking).to.deep.equal([
      'undo-2',
      'undo-1',
      'redo-1',
      'redo-2',
    ]);
    expectUndoRedo(manager, true, false);
  });

  it('resests history for actions with "undoPossibility" equal to "impossible"', function () {
    const manager = UndoManager.create();
    manager.addActionToHistory(new FakeAction('1'));
    manager.addActionToHistory(new FakeAction('2'));
    manager.undo();

    manager.addActionToHistory(
      new FakeAction('3', [], ActionUndoPossibility.Impossible)
    );

    expectUndoRedo(manager, false, false);
  });
});

class FakeAction {
  /**
   * @param {string} id
   * @param {Array<string>} tracking
   */
  constructor(id, tracking = [], undoPossibility = ActionUndoPossibility.Possible) {
    this.id = id;
    this.tracking = tracking;
    this.undoPossibility = undoPossibility;
  }

  execute() {
    this.tracking.push(`redo-${this.id}`);
  }

  executeUndo() {
    this.tracking.push(`undo-${this.id}`);
  }

  destroy() {}
}

function expectUndoRedo(manager, canUndo, canRedo) {
  expect(manager.canUndo).to.equal(canUndo);
  expect(manager.canRedo).to.equal(canRedo);
}
