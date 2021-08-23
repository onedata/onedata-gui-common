import { expect } from 'chai';
import { describe, it } from 'mocha';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/workflow', function () {
  it('has undefined "systemAuditLogStoreInstanceId" property on init', function () {
    const workflow = Workflow.create();
    expect(get(workflow, 'systemAuditLogStoreInstanceId')).to.be.undefined;
  });
});
