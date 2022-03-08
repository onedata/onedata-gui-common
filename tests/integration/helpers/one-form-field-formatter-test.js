import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { certFormatter } from 'onedata-gui-common/helpers/date-format';

describe('Integration | Helper | one form field formatter', function () {
  setupRenderingTest();

  it('handles date format', async function () {
    const date = '2022-05-18T08:50:00+00:00';
    this.set('date', date);
    await render(hbs `{{one-form-field-formatter date "date"}}`);

    expect(this.$().text().trim()).to.equal(moment(date).format(certFormatter));
  });

  it('accepts lack of format', async function () {
    const date = '2022-05-18T08:50:00+00:00';
    this.set('date', date);
    await render(hbs `{{one-form-field-formatter date}}`);

    expect(this.$().text().trim()).to.equal(date);
  });
});
