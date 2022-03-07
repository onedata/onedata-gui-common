import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

describe('Integration | Component | time from now', function () {
  setupRenderingTest();

  it('renders string with time from now', async function () {
    const date = moment();
    this.set('date', date);

    await render(hbs `{{time-from-now date=date}}`);

    const $timeFromNow = this.$('.time-from-now');

    expect($timeFromNow).to.exist;
    expect($timeFromNow, $timeFromNow.text())
      .to.contain('few seconds ago');
  });
});
