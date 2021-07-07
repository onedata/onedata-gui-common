import { expect } from 'chai';
import { describe, it } from 'mocha';
import OneSingletonTaskQueue from 'onedata-gui-common/utils/one-singleton-task-queue';
import sleep from 'onedata-gui-common/utils/sleep';

describe('Unit | Utility | one singleton task queue', function () {
  it('does not schedule task with the same type if its already in queue', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    let globalCounter = 0;
    const fun = async (value) => {
      for (let i = 0; i < value; ++i) {
        globalCounter += 1;
        await sleep(0);
      }
    };

    taskQueue.scheduleTask('increment', () => fun(1));
    taskQueue.scheduleTask('increment', () => fun(2));
    taskQueue.scheduleTask('increment', () => fun(3));

    await taskQueue.executionPromiseObject;

    expect(globalCounter).to.equal(1);
  });

  it('allows to schedule task with the previously executed type after previous task completion', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    let globalCounter = 0;
    const fun = async (value) => {
      for (let i = 0; i < value; ++i) {
        globalCounter += 1;
        await sleep(0);
      }
    };

    taskQueue.scheduleTask('increment', () => fun(3));
    await taskQueue.executionPromiseObject;
    expect(globalCounter).to.equal(3);

    taskQueue.scheduleTask('increment', () => fun(4));
    await taskQueue.executionPromiseObject;
    expect(globalCounter).to.equal(7);
  });

  it('allows to schedule task with type that is not in queue', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    let globalCounter = 0;
    const inc = async (value) => {
      for (let i = 0; i < value; ++i) {
        globalCounter += 1;
        await sleep(0);
      }
    };
    const pow = async (value) => {
      for (let i = 0; i < (value - 1); ++i) {
        globalCounter = globalCounter * globalCounter;
        await sleep(0);
      }
    };

    taskQueue.scheduleTask('increment', () => inc(3));
    taskQueue.scheduleTask('power', () => pow(2));
    await taskQueue.executionPromiseObject;
    expect(globalCounter).to.equal(9);
  });
});
