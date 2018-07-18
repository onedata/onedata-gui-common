import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

describe('Integration | Helper | date format', function () {
  setupComponentTest('date-format', {
    integration: true
  });

  it('parses and renders date for certs view', function () {
    this.set('inputDate', moment('2022-05-18T08:50:00+00:00').toISOString());
    this.render(hbs `{{date-format inputDate format="cert" timezone="+00:00"}}`);

    expect(this.$().text().trim()).to.equal('2022-05-18 at 8:50 (UTC+00:00)');
  });

  it('renders blank string for unparseable date or null', function () {
    this.set('inputDate', '');
    this.render(hbs `{{date-format inputDate}}`);

    expect(this.$().text().trim()).to.equal('');
  });

  it('can use moment.Moment object', function () {
    this.set('inputDate', moment('2022-05-18T08:50:00+00:00'));
    this.render(hbs `{{date-format inputDate format="cert" timezone="+00:00"}}`);

    expect(this.$().text().trim()).to.equal('2022-05-18 at 8:50 (UTC+00:00)');
  });
});
