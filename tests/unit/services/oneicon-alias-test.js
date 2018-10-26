import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | oneicon name translator', function () {
  setupTest('service:oneicon-alias', {});

  it('returns name for existing context and keyword', function () {
    const service = this.subject();
    expect(service.getName('__global', 'role_holders')).to.equal('role-holders');
  });

  it('returns keyword for incorrect context and keyword', function () {
    const service = this.subject();
    const keyword = 'randomKeyword';
    expect(service.getName('randomContext', keyword)).to.equal(keyword);
  });

  it('returns name from global context, when context is not specified',
    function () {
      const service = this.subject();
      expect(service.getName('role_holders')).to.equal('role-holders');
    }
  );
});
