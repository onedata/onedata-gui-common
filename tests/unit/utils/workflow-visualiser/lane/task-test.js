import { expect } from 'chai';
import { describe, it } from 'mocha';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/task', function () {
  it('has "__type" equal to "task"', function () {
    const element = Task.create();

    expect(get(element, '__type')).to.equal('task');
  });

  it('has "renderer" equal to "workflow-visualiser/lane/task"', function () {
    const task = Task.create();

    expect(get(task, 'renderer')).to.equal('workflow-visualiser/lane/task');
  });

  it('has "status" equal to "default" on init', function () {
    const task = Task.create();

    expect(get(task, 'status')).to.equal('default');
  });

  it('has "progressPercent" equal to null on init', function () {
    const task = Task.create();

    expect(get(task, 'progressPercent')).to.be.null;
  });
});
