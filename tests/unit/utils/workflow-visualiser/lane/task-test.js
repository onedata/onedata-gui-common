import { expect } from 'chai';
import { describe, it } from 'mocha';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/task', function () {
  it('has "__modelType" equal to "task"', function () {
    const element = Task.create();

    expect(get(element, '__modelType')).to.equal('task');
  });

  it('has "renderer" equal to "workflow-visualiser/lane/task"', function () {
    const task = Task.create();

    expect(get(task, 'renderer')).to.equal('workflow-visualiser/lane/task');
  });

  ['lambdaId', 'argumentMappings', 'resultMappings'].forEach(propName => {
    it(`has "${propName}" equal to undefined on init`, function () {
      const task = Task.create();

      expect(get(task, propName)).to.undefined;
    });
  });

  ['itemsFailed', 'itemsInProcessing', 'itemsProcessed'].forEach(propName => {
    it(`has "${propName}" equal to 0 on init`, function () {
      const task = Task.create();

      expect(get(task, propName)).to.equal(0);
    });
  });
});
