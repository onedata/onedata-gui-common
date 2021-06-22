import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | modal manager', function () {
  setupTest('service:modal-manager', {});

  it('hide() returns promise even if show() has not been called', function () {
    const service = this.subject();

    expect(service.hide('abc').constructor.name).to.equal('Promise');
  });
});
