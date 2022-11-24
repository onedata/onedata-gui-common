import { expect } from 'chai';
import { describe, it } from 'mocha';
import DuplicateNameHashMapper from 'onedata-gui-common/utils/duplicate-name-hash-mapper';
import EmberObject, { computed } from '@ember/object';

const hashMatcher = /[0-9a-f]{4}/;

describe('Unit | Utility | duplicate name hash mapper', function () {
  it('exposes a hash for values if name is duplicated', function () {
    const subject = DuplicateNameHashMapper.create();

    subject.addPair('one', '/root1/one');
    subject.addPair('one', '/root2/one');

    expect(subject.hashMapping['/root1/one'], 'root1').to.match(hashMatcher);
    expect(subject.hashMapping['/root2/one'], 'root2').to.match(hashMatcher);
  });

  it('does not expose a hash for name if name has single occurence', function () {
    const subject = DuplicateNameHashMapper.create();

    subject.addPair('one', '/root/one');

    expect(subject.hashMapping['/root1/one']).to.be.undefined;
  });

  it('does not expose a hash for name if the same name-value pair has been added multiple times', function () {
    const subject = DuplicateNameHashMapper.create();

    subject.addPair('one', '/root/one');
    subject.addPair('one', '/root/one');

    expect(subject.hashMapping['/root1/one']).to.be.undefined;
  });

  it('has observable hash mapping notifying when mapping is updated by adding', function () {
    const subject = DuplicateNameHashMapper.create();
    const observingObject = EmberObject.extend({
      duplicateNameHashMapper: undefined,

      root1: computed('duplicateNameHashMapper.hashMapping', function root1() {
        return this.duplicateNameHashMapper.hashMapping['/root1/one'];
      }),

      root2: computed('duplicateNameHashMapper.hashMapping', function root2() {
        return this.duplicateNameHashMapper.hashMapping['/root2/one'];
      }),
    }).create({
      duplicateNameHashMapper: subject,
    });

    subject.addPair('one', '/root1/one');
    expect(observingObject.root1).to.be.undefined;
    expect(observingObject.root2).to.be.undefined;

    subject.addPair('one', '/root2/one');
    expect(observingObject.root1).to.match(hashMatcher);
    expect(observingObject.root2).to.match(hashMatcher);
  });
});
