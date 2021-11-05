import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

const componentClassName = 'runs-list';

describe('Integration | Component | workflow visualiser/lane/runs list', function () {
  setupComponentTest('workflow-visualiser/lane/runs-list', {
    integration: true,
  });

  it(`has class "${componentClassName}"`, async function () {
    await render(this);

    expect(this.$().children().eq(0)).to.have.class(componentClassName);
  });

  it('shows all runs, when number of runs is smaller than visible runs limit', async function () {
    this.setProperties({
      visibleRunsLimit: 3,
      runsRegistry: generateRunsRegistry(2),
    });

    await render(this);

    expect(getVisibleRunNumbers(this)).to.deep.equal([1, 2]);
  });

  it('shows latest runs, when number of runs is larger than visible runs limit', async function () {
    this.setProperties({
      visibleRunsLimit: 3,
      runsRegistry: generateRunsRegistry(5),
    });

    await render(this);

    expect(getVisibleRunNumbers(this)).to.deep.equal([3, 4, 5]);
  });

  it('does not show newest runs from update, if already rendered runs fill the whole space', async function () {
    this.setProperties({
      visibleRunsLimit: 3,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);

    this.set('runs', generateRunsRegistry(8));
    await wait();

    expect(getVisibleRunNumbers(this)).to.deep.equal([3, 4, 5]);
  });

  it('shows some new runs from update, if already rendered runs do not fill the whole space', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(3),
    });
    await render(this);

    this.set('runsRegistry', generateRunsRegistry(6));
    await wait();

    expect(getVisibleRunNumbers(this)).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('allows to move to the left', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(15),
    });
    await render(this);

    await moveLeft();

    expect(getVisibleRunNumbers(this)).to.deep.equal([6, 7, 8, 9, 10]);
  });

  it('allows to move to the left and back to the right', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(15),
    });
    await render(this);

    await moveLeft();
    await moveRight();

    expect(getVisibleRunNumbers(this)).to.deep.equal([11, 12, 13, 14, 15]);
  });

  it('allows to move to the right to see new runs after update', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);
    this.set('runsRegistry', generateRunsRegistry(8));
    await wait();

    await moveRight();

    expect(getVisibleRunNumbers(this)).to.deep.equal([4, 5, 6, 7, 8]);
  });

  it('allows to move to the left by partial move', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(8),
    });
    await render(this);

    await moveLeft();

    expect(getVisibleRunNumbers(this)).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('allows only one move left at a time', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(15),
    });
    await render(this);

    await moveLeft(false);
    await moveLeft();

    expect(getVisibleRunNumbers(this)).to.deep.equal([6, 7, 8, 9, 10]);
  });

  it('allows only one move right at a time', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);
    this.set('runsRegistry', generateRunsRegistry(15));
    await wait();

    await moveRight(false);
    await moveRight();

    expect(getVisibleRunNumbers(this)).to.deep.equal([6, 7, 8, 9, 10]);
  });

  it('allows only one move (right) at a time, when moving right and then left', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);
    this.set('runsRegistry', generateRunsRegistry(10));
    await wait();

    await moveRight(false);
    await moveLeft();

    expect(getVisibleRunNumbers(this)).to.deep.equal([6, 7, 8, 9, 10]);
  });

  it('allows only one move (left) at a time, when moving left and then right', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(10),
    });
    await render(this);

    await moveLeft(false);
    await moveRight();

    expect(getVisibleRunNumbers(this)).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('allows to move left twice', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(12),
    });
    await render(this);

    await moveLeft();
    await moveLeft();

    expect(getVisibleRunNumbers(this)).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('allows to move right twice', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);
    this.set('runsRegistry', generateRunsRegistry(12));
    await wait();

    await moveRight();
    await moveRight();

    expect(getVisibleRunNumbers(this)).to.deep.equal([8, 9, 10, 11, 12]);
  });

  it('does not allow to move right, if there is no place to move', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(10),
    });
    await render(this);

    expect(this.$('.show-next-runs')).to.be.disabled;
  });

  it('allows to move right, if there is a place to move', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);
    this.set('runsRegistry', generateRunsRegistry(6));
    await wait();

    expect(this.$('.show-next-runs')).to.not.be.disabled;
  });

  it('does not allow to move left, if there is no place to move', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);
    this.set('runsRegistry', generateRunsRegistry(6));
    await wait();

    expect(this.$('.show-prev-runs')).to.be.disabled;
  });

  it('allows to move right, if there is a place to move', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(6),
    });
    await render(this);

    expect(this.$('.show-prev-runs')).to.not.be.disabled;
  });

  it('has no run selected by default', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
    });
    await render(this);

    expect(getComponent(this).find('.run-indicator.selected')).to.not.exist;
  });

  it('marks run as selected', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
      selectedRunNumber: 3,
    });
    await render(this);

    const $selectedIndicators = getComponent(this).find('.run-indicator.selected');
    expect($selectedIndicators).to.have.length(1);
    expect($selectedIndicators.find('.run-number').text().trim()).to.equal('3');
  });

  it('notifies about run selection change via "onSelectionChange" callback', async function () {
    this.setProperties({
      visibleRunsLimit: 5,
      runsRegistry: generateRunsRegistry(5),
      selectedRunNumber: 3,
    });
    await render(this);

    await click(getComponent(this).find('.run-indicator')[1]);

    expect(this.get('selectionChangeSpy'))
      .to.be.calledOnce.and.to.be.calledWith(2);
  });
});

async function render(testCase) {
  testCase.set(
    'selectionChangeSpy',
    sinon.spy((runNumber) => testCase.set('selectedRunNumber', runNumber))
  );
  testCase.render(hbs `{{workflow-visualiser/lane/runs-list
    visibleRunsPosition=visibleRunsPosition
    visibleRunsLimit=visibleRunsLimit
    runsRegistry=runsRegistry
    selectedRunNumber=selectedRunNumber
    onSelectionChange=selectionChangeSpy
    onVisibleRunsPositionChange=(action (mut visibleRunsPosition))
  }}`);
  await wait();
}

function getComponent(testCase) {
  return testCase.$(`.${componentClassName}`);
}

async function moveLeft(waitForSettle = true) {
  if (waitForSettle) {
    await click('.show-prev-runs');
    await waitForMoveToSettle();
  } else {
    click('.show-prev-runs');
  }
}

async function moveRight(waitForSettle = true) {
  if (waitForSettle) {
    await click('.show-next-runs');
    await waitForMoveToSettle();
  } else {
    click('.show-next-runs');
  }
}

async function waitForMoveToSettle() {
  // Due to animations we need several wait-s. For 3-4 waits there is a ~1:10
  // chance to fail some tests in the whole suite. 10 waits are safe enough.
  for (let i = 0; i < 10; i++) {
    await wait();
  }
}

function generateRunsRegistry(runsCount) {
  const runsRegistry = {};
  for (let i = 1; i <= runsCount; i++) {
    const run = {
      runNumber: i,
      status: 'finished',
    };
    if (i > 2) {
      run.originRunNumber = i - 2;
    }
    runsRegistry[i] = run;
  }
  return runsRegistry;
}

function getVisibleRunNumbers(testCase) {
  const $runIndicators = getComponent(testCase).find('.run-indicator');
  return $runIndicators.map(function () {
    const runNumber = Number(this.querySelector('.run-number').textContent.trim());
    const originRunNumberElement = this.querySelector('.origin-run-number');
    const originRunNumber = originRunNumberElement ?
      Number(originRunNumberElement.textContent.trim()) : null;
    const hasFinishedStatus = this.classList.contains('status-finished');
    if (
      ((runNumber === 1 || runNumber === 2) && originRunNumber !== null) ||
      (runNumber > 2 && originRunNumber !== runNumber - 2) ||
      !hasFinishedStatus
    ) {
      throw new Error('Invalid run indicator');
    }
    return runNumber;
  }).toArray();
}