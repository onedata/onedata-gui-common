import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | scroll state', function () {
  setupTest();
  it('changes lastScrollEvent', function () {
    let service = this.owner.lookup('service:scroll-state');
    const event = new Event('click');
    service.scrollOccurred(event);
    expect(service.lastScrollEvent).to.be.equal(event);
  });
});
