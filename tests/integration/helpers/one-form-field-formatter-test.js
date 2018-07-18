import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | one form field formatter', function () {
  setupComponentTest('one-form-field-formatter', {
    integration: true
  });

  it('handles date format', function () {
    this.render(hbs `{{one-form-field-formatter "2022-05-18T08:50:00+00:00" "date"}}`);

    expect(this.$().text().trim()).to.equal('2022-05-18 at 8:50 (UTC+00:00)');
  });
});
