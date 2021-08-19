import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import { get } from '@ember/object';

describe('Unit | Service | clipboard actions', function () {
  setupTest('service:clipboard-actions', {});

  it('creates action "CopyRecordIdAction"', function () {
    const service = this.subject();
    const record = {};

    const action = service.createCopyRecordIdAction({ record });

    expect(action).to.be.instanceOf(CopyRecordIdAction);
    expect(get(action, 'record')).to.equal(record);
  });
});
