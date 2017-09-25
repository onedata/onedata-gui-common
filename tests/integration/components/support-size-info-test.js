import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import Ember from 'ember';

const {
  A,
} = Ember;

describe('Integration | Component | support size info', function () {
  setupComponentTest('support-size-info', {
    integration: true
  });

  beforeEach(function () {
    this.set('data', A([
      Ember.Object.create({
        id: '1',
        label: 'Provider1',
        value: 1048576,
        color: 'red',
      }),
      Ember.Object.create({
        id: '2',
        label: 'Provider2',
        value: 1048576,
        color: 'blue',
      }),
    ]));
  });

  it('renders total support size', function () {
    this.render(hbs `
      {{support-size-info data=data}}
    `);

    expect(this.$('.support-size')).to.contain('2 MiB');
  });

  it('renders support size chart', function (done) {
    this.render(hbs `
      {{support-size-info data=data}}
    `);
    wait().then(() => {
      ['Provider1', 'Provider2'].forEach((name) =>
        expect(this.$(`text:contains("${name}"), li:contains("${name}")`))
        .to.exist
      );
      done();
    })
  });

  it('renders support size table', function (done) {
    this.render(hbs `
      {{support-size-info
        data=data
        supporterNameHeader="Provider"
        supporterSizeHeader="Support size"}}
    `);
    click('.btn.table-mode').then(() => {
      let dataRows = this.$('tbody tr');
      expect(dataRows).to.have.length(2);
      let dataRow = dataRows.eq(0);
      expect(dataRow.children()).to.have.length(2);
      expect(dataRow.children().eq(0)).to.contain('Provider1');
      expect(dataRow.children().eq(1)).to.contain('1 MiB');
      done();
    })
  });
});
