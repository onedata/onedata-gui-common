import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | one animated logo', function () {
  setupComponentTest('one-animated-logo', {
    integration: true,
  });

  it('expands and collapses', function () {
    this.set('opened', false);
    this.render(hbs `{{one-animated-logo opened=opened}}`);

    expect(this.$('.one-animated-logo')).not.to.have.class('opened');
    this.set('opened', true);
    return wait().then(() => {
      expect(this.$('.one-animated-logo')).to.have.class('opened');
      this.set('opened', false);
      return wait().then(() => {
        expect(this.$('.one-animated-logo')).not.to.have.class('opened');
      });
    });
  });
});
