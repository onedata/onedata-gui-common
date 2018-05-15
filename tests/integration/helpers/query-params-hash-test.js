import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | query params hash', function () {
  setupComponentTest('query-params-hash', {
    integration: true
  });

  it('renders', function () {
    this.set('inputValue', '1234');

    this.render(hbs `{{query-params-hash inputValue}}`);

    expect(this.$().text().trim()).to.equal('1234');
  });
});
