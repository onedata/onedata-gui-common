import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';

describe('Integration | Helper | date-format', function () {
  setupRenderingTest();

  it('parses and renders date for certs view', async function () {
    this.set('inputDate', moment('2022-05-18T08:50:00+00:00').toISOString());
    await render(hbs `{{date-format inputDate format="cert" timezone="+00:00"}}`);

    expect(this.element.textContent.trim()).to.equal('2022-05-18 at 8:50 (UTC+00:00)');
  });

  it('renders blank string for unparseable date or null', async function () {
    this.set('inputDate', '');
    await render(hbs `{{date-format inputDate}}`);

    expect(this.element.textContent.trim()).to.equal('');
  });

  it('can use moment.Moment object', async function () {
    this.set('inputDate', moment('2022-05-18T08:50:00+00:00'));
    await render(hbs `{{date-format inputDate format="cert" timezone="+00:00"}}`);

    expect(this.element.textContent.trim()).to.equal('2022-05-18 at 8:50 (UTC+00:00)');
  });

  it('renders special string for unparseable date or null in cert format', async function () {
    this.set('inputDate', '');
    await render(hbs `{{date-format inputDate format="cert"}}`);

    expect(this.element.textContent.trim()).to.equal('never');
  });

  it('can render date string from timestamp', async function () {
    this.set('inputDate', moment('2022-05-18T08:50:00+00:00').unix());
    await render(hbs `{{date-format inputDate format="dateWithMinutes"}}`);

    expect(this.element.textContent.trim()).to.match(/18 May 2022 \d+:50/);
  });
});
