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

  it('returns a promise that resolves when scheduled task resolves', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    let globalCounter = 0;
    const fun = async (value) => {
      for (let i = 0; i < value; ++i) {
        globalCounter += 1;
        await sleep(0);
      }
      return value;
    };

    const f1Promise = taskQueue.scheduleTask('f1', () => fun(3));
    const f2Promise = taskQueue.scheduleTask('f2', () => fun(4));
    const f1Result = await f1Promise;
    expect(f1Result, 'task 1 result').to.equal(3);
    // second task should not end yet, but it could start
    expect(globalCounter, 'first globalCounter').to.not.equal(7);
    const f2Result = await f2Promise;
    expect(f2Result, 'task 2 result').to.equal(4);
    expect(globalCounter, 'second globalCounter').to.equal(7);
  });

  it('returns a promise for an existing task when scheduling with the same type', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    const fun = async (value) => {
      for (let i = 0; i < value; ++i) {
        await sleep(0);
      }
      return value;
    };

    const f1Promise = taskQueue.scheduleTask('fun', () => fun(3));
    const f2Promise = taskQueue.scheduleTask('fun', () => fun(4));

    const f1Result = await f1Promise;
    expect(f1Result, 'task 1 result').to.equal(3);
    const f2Result = await f2Promise;
    expect(f2Result, 'task 2 result').to.equal(3);
    expect(f1Promise).to.equal(f2Promise);
  });
});
