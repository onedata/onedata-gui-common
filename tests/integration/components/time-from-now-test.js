import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';

describe('Integration | Component | time from now', function () {
  setupRenderingTest();

  it('renders string with time from now', async function () {
    const date = moment();
    this.set('date', date);

    await render(hbs `{{time-from-now date=date}}`);

    const timeFromNowElem = find('.time-from-now');

    expect(timeFromNowElem).to.exist;
    expect(timeFromNowElem.textContent).to.contain('few seconds ago');
  });
});
