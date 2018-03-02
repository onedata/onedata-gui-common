import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one tile', function () {
  setupComponentTest('one-tile', {
    integration: true
  });

  it('renders tile title', function () {
    this.render(hbs `{{one-tile title="hello"}}`);
    expect(this.$().text()).to.match(/.*hello.*/);
  });
});
