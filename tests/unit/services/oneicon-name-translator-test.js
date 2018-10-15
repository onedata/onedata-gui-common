import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | oneicon name translator', function () {
  setupTest('service:oneicon-name-translator', {});

  it('returns name for existing context and keyword', function () {
    let service = this.subject();
    expect(service.getName('group', 'role_holders')).to.equal('role-holders');
  });

  it('returns keyword for incorrect context and keyword', function () {
    let service = this.subject();
    const keyword = 'randomKeyword';
    expect(service.getName('randomContext', keyword)).to.equal(keyword);
  });
});
