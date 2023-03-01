import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

describe('Integration | Component | atm-workflow/value-presenters/time-series-measurement/table-body-row-presenter',
  function () {
    setupRenderingTest();

    it('has classes "table-body-row-presenter" and "time-series-measurement-table-body-row-presenter"',
      async function () {
        await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/table-body-row-presenter}}`);

        expect(this.element.children).to.have.length(1);
        expect(this.element.children[0]).to.have.class('table-body-row-presenter')
          .and.to.have.class('time-series-measurement-table-body-row-presenter');
      }
    );

    it('shows three columns - time, time series name and value', async function () {
      const { timestamp } = this.set('value', {
        tsName: 'series1',
        timestamp: 1659533491,
        value: 30,
      });
      await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/table-body-row-presenter
        value=value
      }}`);

      const formattedTime = dateFormat([timestamp], { format: 'report' });

      const tds = findAll('.table-body-row-presenter td');
      expect(tds).to.have.length(3);
      expect(tds[0]).to.have.class('column-timestamp')
        .and.to.have.trimmed.text(formattedTime);
      expect(tds[1]).to.have.class('column-ts-name')
        .and.to.have.trimmed.text('series1');
      expect(tds[2]).to.have.class('column-value')
        .and.to.have.trimmed.text('30');
    });
  });
