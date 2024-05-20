import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import { get } from '@ember/object';

describe('Unit | Service | clipboard-actions', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.action?.destroy();
  });

  it('creates action "CopyRecordIdAction"', function () {
    const service = this.owner.lookup('service:clipboard-actions');
    const record = {};

    this.action = service.createCopyRecordIdAction({ record });

    expect(this.action).to.be.instanceOf(CopyRecordIdAction);
    expect(get(this.action, 'record')).to.equal(record);
  });
});
