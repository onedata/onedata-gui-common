import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

describe('Integration | Component | atm workflow/value presenters/time series measurement/single line presenter',
  function () {
    setupRenderingTest();

    it('has classes "single-line-presenter" and "time-series-measurement-single-line-presenter"', async function () {
      await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/single-line-presenter}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('single-line-presenter')
        .and.to.have.class('time-series-measurement-single-line-presenter');
    });

    it('presents passed value as a time series measurement', async function () {
      const { timestamp } = this.set('value', {
        tsName: 'series1',
        timestamp: 1659533491,
        value: 30,
      });
      await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/single-line-presenter
        value=value
      }}`);

      const formattedTime = dateFormat([timestamp], { format: 'report' });

      expect(find('.single-line-presenter'))
        .to.have.trimmed.text(`<TSMeas. ${formattedTime};"series1";30>`);
    });
  }
);
