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

  it('schedules task with existing type if forceScheduleTask is used', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    let globalCounter = 0;
    const fun = async (value) => {
      for (let i = 0; i < value; ++i) {
        globalCounter += 1;
        await sleep(0);
      }
    };

    taskQueue.forceScheduleTask('increment', () => fun(1));
    taskQueue.forceScheduleTask('increment', () => fun(2));
    taskQueue.forceScheduleTask('increment', () => fun(3));

    await taskQueue.executionPromiseObject;

    expect(globalCounter).to.equal(6);
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

  it('can return current task promise', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    const fun = async (value) => {
      await sleep(0);
      return value;
    };

    taskQueue.scheduleTask('fun1', () => fun(1));
    taskQueue.scheduleTask('fun2', () => fun(2));
    taskQueue.scheduleTask('fun3', () => fun(3));

    const currentPromise = taskQueue.getCurrentTaskPromise();

    expect(await currentPromise).to.equal(1);
  });

  it('returns empty promise if current task promise is requested, but queue is empty', async function () {
    const taskQueue = new OneSingletonTaskQueue();

    const currentPromise = taskQueue.getCurrentTaskPromise();

    expect(currentPromise).to.have.property('then');
    expect(await currentPromise).to.equal(undefined);
  });

  it('can return promise for task currently in queue by type', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    const fun = async (value) => {
      await sleep(0);
      return value;
    };

    taskQueue.scheduleTask('fun1', () => fun(1));
    taskQueue.scheduleTask('fun2', () => fun(2));
    taskQueue.scheduleTask('fun3', () => fun(3));

    const promiseForTask = taskQueue.getTaskPromise('fun2');

    expect(await promiseForTask).to.equal(2);
  });

  it('returns empty promise if task promise by type is requested, but there is no such task', async function () {
    const taskQueue = new OneSingletonTaskQueue();
    const fun = async (value) => {
      await sleep(0);
      return value;
    };

    taskQueue.scheduleTask('fun1', () => fun(1));
    taskQueue.scheduleTask('fun2', () => fun(2));
    taskQueue.scheduleTask('fun3', () => fun(3));

    const promiseForTask = taskQueue.getTaskPromise('fun4');

    expect(promiseForTask).to.have.property('then');
    expect(await promiseForTask).to.equal(undefined);
  });

  it('puts a task on the queue end by default', async function () {
    const results = [];
    const taskQueue = new OneSingletonTaskQueue();

    taskQueue.scheduleTask('one', () => results.push('one'));
    taskQueue.scheduleTask('two', () => results.push('two'));
    await taskQueue.executionPromiseObject;

    expect(results).to.deep.equal(['one', 'two']);
  });

  it('puts a task before other if insertBeforeType option is specified', async function () {
    const results = [];
    const taskQueue = new OneSingletonTaskQueue();

    taskQueue.scheduleTask('one', () => results.push('one'));
    taskQueue.scheduleTask('two', () => results.push('two'));
    taskQueue.scheduleTask('three', () => results.push('three'), {
      insertBeforeType: 'two',
    });
    await taskQueue.executionPromiseObject;

    expect(results).to.deep.equal(['one', 'three', 'two']);
  });

  it('does not put a task before other if insertBeforeType option is specified but the other task is currently running',
    async function () {
      const results = [];
      const taskQueue = new OneSingletonTaskQueue();

      taskQueue.scheduleTask('one', () => results.push('one'));
      expect(taskQueue.currentTask?.type).to.equal('one');
      taskQueue.scheduleTask('two', () => results.push('two'), {
        insertBeforeType: 'one',
      });
      await taskQueue.executionPromiseObject;

      expect(results).to.deep.equal(['one', 'two']);
    }
  );

  it('puts a task before first non-current duplicate if insertBeforeType option is specified', async function () {
    const results = [];
    const taskQueue = new OneSingletonTaskQueue();

    taskQueue.scheduleTask('one', () => results.push('one'));
    expect(taskQueue.currentTask?.type).to.equal('one');
    taskQueue.scheduleTask('two', () => results.push('two'));
    // this is not typical situation, but possible
    taskQueue.forceScheduleTask('one', () => results.push('one'));
    taskQueue.scheduleTask('three', () => results.push('three'), {
      insertBeforeType: 'one',
    });
    await taskQueue.executionPromiseObject;

    expect(results).to.deep.equal(['one', 'two', 'three', 'one']);
  });
});
