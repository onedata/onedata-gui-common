import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import RecordOptionsArrayProxy from 'onedata-gui-common/utils/record-options-array-proxy';
import { setupTest } from 'ember-mocha';
import { getProperties, get } from '@ember/object';

describe('Integration | Utility | record options array proxy', function () {
  setupTest();

  beforeEach(function () {
    this.set('records', [{
      name: 'def',
      constructor: {
        modelName: 'space',
      },
    }, {
      name: 'abc',
      constructor: {
        modelName: 'harvester',
      },
    }]);
  });

  it('constructs record option object', function () {
    const records = this.get('records');

    const arrayProxy = RecordOptionsArrayProxy.create({ records });

    const {
      value,
      label,
      icon,
    } = getProperties(arrayProxy.objectAt(0), 'value', 'label', 'icon');
    expect(value).to.equal(records[1]);
    expect(label).to.equal('abc');
    expect(icon).to.equal('light-bulb');
  });

  it('sorts options by record name', function () {
    const records = this.get('records');

    const arrayProxy = RecordOptionsArrayProxy.create({ records });

    expect(get(arrayProxy.objectAt(0), 'value')).to.equal(records[1]);
    expect(get(arrayProxy.objectAt(1), 'value')).to.equal(records[0]);
  });
});
