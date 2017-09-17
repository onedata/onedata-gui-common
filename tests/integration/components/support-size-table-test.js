import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {
  A,
} = Ember;

describe('Integration | Component | support size table', function () {
  setupComponentTest('support-size-table', {
    integration: true
  });

  beforeEach(function () {
    this.set('data', A([
      Ember.Object.create({
        supporterName: 'Provider1',
        supportSize: 1048576,
      }),
    ]));
  });

  it('renders support size info', function () {
    this.render(hbs `
      {{support-size-table
        data=data
        supporterNameHeader="Provider"
        supporterSizeHeader="Support size"}}
    `);
    let dataRow = this.$('tbody tr');
    expect(dataRow).to.exist;
    expect(dataRow.children()).to.have.length(2);
    expect(dataRow.children().eq(0)).to.contain('Provider1');
    expect(dataRow.children().eq(1)).to.contain('1 MiB');
  });
});
