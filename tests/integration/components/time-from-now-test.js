import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

describe('Integration | Component | time from now', function () {
  setupComponentTest('time-from-now', {
    integration: true
  });

  it('renders string with time from now', function () {
    const date = moment();
    this.set('date', date);

    this.render(hbs `{{time-from-now date=date}}`);

    const $timeFromNow = this.$('.time-from-now');

    expect($timeFromNow).to.exist;
    expect($timeFromNow, $timeFromNow.text())
      .to.contain('few seconds ago');
  });
});
