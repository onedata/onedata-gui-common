import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import { get, getProperties, set } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe('Integration | Utility | clipboard actions/copy record id action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const record = {
      constructor: {
        modelName: undefined,
      },
      entityId: 'someId',
    };
    const action = CopyRecordIdAction.create({
      ownerSource: this,
      context: {
        record,
      },
    });
    const globalClipboardCopyStub =
      sinon.stub(lookupService(this, 'global-clipboard'), 'copy');
    this.setProperties({
      action,
      record,
      globalClipboardCopyStub,
    });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('copy-record-id-action-trigger');
    expect(icon).to.equal('copy');
    expect(String(title)).to.equal('Copy ID');
  });

  it('passes record id to global-clipboard on execute (empty model name scenario)', async function () {
    const {
      action,
      record,
      globalClipboardCopyStub,
    } = this.getProperties('action', 'record', 'globalClipboardCopyStub');

    expect(globalClipboardCopyStub).to.not.be.called;

    const result = await action.execute();

    expect(globalClipboardCopyStub).to.be.calledOnce.and.to.be.calledWith(
      record.entityId, {
        string: 'ID',
      },
    );
    expect(get(result, 'status')).to.equal('done');
  });

  it('passes record id to global-clipboard on execute (known model name scenario)',
    async function () {
      const {
        action,
        record,
        globalClipboardCopyStub,
      } = this.getProperties('action', 'record', 'globalClipboardCopyStub');
      this.set('record.constructor.modelName', 'group');

      const result = await action.execute();

      expect(globalClipboardCopyStub).to.be.calledOnce.and.to.be.calledWith(
        record.entityId, {
          string: 'group ID',
        },
      );
      expect(get(result, 'status')).to.equal('done');
    });

  it('does not call global-clipboard functionality on execute if record has empty id',
    async function () {
      const {
        action,
        record,
        globalClipboardCopyStub,
      } = this.getProperties('action', 'record', 'globalClipboardCopyStub');
      set(record, 'entityId', undefined);

      const result = await action.execute();

      expect(globalClipboardCopyStub).to.not.be.called;
      expect(get(result, 'status')).to.equal('failed');
    });
});
