import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/time-series-measurement/table header row presenter',
  function () {
    setupRenderingTest();

    it('has classes "table-header-row-presenter" and "time-series-measurement-table-header-row-presenter"',
      async function () {
        await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/table-header-row-presenter}}`);

        expect(this.element.children).to.have.length(1);
        expect(this.element.children[0]).to.have.class('table-header-row-presenter')
          .and.to.have.class('time-series-measurement-table-header-row-presenter');
      }
    );

    it('shows three column headers - time, time series name and value', async function () {
      await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/table-header-row-presenter}}`);

      const ths = findAll('.table-header-row-presenter th');
      expect(ths).to.have.length(3);
      expect(ths[0]).to.have.class('column-timestamp')
        .and.to.have.trimmed.text('Time');
      expect(ths[1]).to.have.class('column-ts-name')
        .and.to.have.trimmed.text('Time series name');
      expect(ths[2]).to.have.class('column-value')
        .and.to.have.trimmed.text('Value');
    });
  });
