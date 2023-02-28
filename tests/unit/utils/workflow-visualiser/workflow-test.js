import { expect } from 'chai';
import { describe, it } from 'mocha';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';
import { get } from '@ember/object';

describe('Unit | Utility | workflow-visualiser/workflow', function () {
  ['instanceId', 'systemAuditLogStoreInstanceId'].forEach(fieldName => {
    it(`has undefined "${fieldName}" property on init`, function () {
      const workflow = Workflow.create();
      expect(get(workflow, fieldName)).to.be.undefined;
    });
  });
});
