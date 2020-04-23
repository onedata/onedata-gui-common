import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import RecordOptionsArrayProxy from 'onedata-gui-common/utils/record-options-array-proxy';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import { setupComponentTest } from 'ember-mocha';
import { getProperties, get } from '@ember/object';

describe('Integration | Utility | record options array proxy', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    this.set('records', [{
      name: 'def',
      constructor: {
        modelName: 'xyz',
      },
    }, {
      name: 'abc',
      constructor: {
        modelName: 'xyz',
      },
    }]);
  });

  it('constructs record option object', function () {
    const records = this.get('records');
    sinon.stub(lookupService(this, 'oneicon-alias'), 'getName')
      .withArgs('xyz').returns('someicon');

    const arrayProxy = RecordOptionsArrayProxy.create({
      ownerSource: this,
      records,
    });

    const {
      value,
      label,
      icon,
    } = getProperties(arrayProxy.objectAt(0), 'value', 'label', 'icon');

    expect(value).to.equal(records[1]);
    expect(label).to.equal('abc');
    expect(icon).to.equal('someicon');
  });

  it('sorts options by record name', function () {
    const records = this.get('records');

    const arrayProxy = RecordOptionsArrayProxy.create({
      ownerSource: this,
      records,
    });

    expect(get(arrayProxy.objectAt(0), 'value')).to.equal(records[1]);
    expect(get(arrayProxy.objectAt(1), 'value')).to.equal(records[0]);
  });
});
