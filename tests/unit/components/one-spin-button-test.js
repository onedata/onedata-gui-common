import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';

describe('Unit | Component | one spin button', function () {
  setupComponentTest('one-spin-button', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true,
  });

  it('has defaultTimeout set to 0', function () {
    let component = this.subject();
    this.render();
    expect(component.get('defaultTimeout')).to.equal(0);
    expect(this.$()).to.exist;
  });
});
