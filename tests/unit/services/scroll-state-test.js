import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | scroll state', function () {
  setupTest('service:scroll-state', {});
  it('changes lastScrollEvent', function () {
    const service = this.subject();
    const event = new Event('click');
    service.scrollOccurred(event);
    expect(service.lastScrollEvent).to.be.equal(event);
  });
});
