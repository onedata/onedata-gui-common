import { expect } from 'chai';
import { describe, it } from 'mocha';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/task', function () {
  it('has "renderer" equal to "workflow-visualiser/lane/task"', function () {
    const task = Task.create();

    expect(get(task, 'renderer')).to.equal('workflow-visualiser/lane/task');
  });

  it('has "type" equal to "task"', function () {
    const element = Task.create();

    expect(get(element, 'type')).to.equal('task');
  });

  it('has undefined "name" on init', function () {
    const task = Task.create();

    expect(get(task, 'name')).to.be.undefined;
  });

  it('has "status" equal to "default" on init', function () {
    const task = Task.create();

    expect(get(task, 'status')).to.equal('default');
  });

  it('has "progressPercent" equal to 0 on init', function () {
    const task = Task.create();

    expect(get(task, 'progressPercent')).to.equal(0);
  });
});
