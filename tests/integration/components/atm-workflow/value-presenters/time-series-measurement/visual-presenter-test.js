import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

describe('Integration | Component | atm workflow/value presenters/time series measurement/visual presenter',
  function () {
    setupRenderingTest();

    it('has classes "visual-presenter" and "time-series-measurement-visual-presenter"', async function () {
      await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/visual-presenter}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('visual-presenter')
        .and.to.have.class('time-series-measurement-visual-presenter');
    });

    it('presents passed value', async function () {
      const { timestamp } = this.set('value', {
        tsName: 'series1',
        timestamp: 1659533491,
        value: 30,
      });
      await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/visual-presenter
      value=value
    }}`);

      const formattedTime = dateFormat([timestamp], { format: 'report' });

      expect(find('.timestamp-property .property-label')).to.have.trimmed.text('Time:');
      expect(find('.timestamp-property .property-value')).to.have.trimmed.text(formattedTime);
      expect(find('.tsName-property .property-label')).to.have.trimmed.text('Time series name:');
      expect(find('.tsName-property .property-value')).to.have.trimmed.text('series1');
      expect(find('.value-property .property-label')).to.have.trimmed.text('Value:');
      expect(find('.value-property .property-value')).to.have.trimmed.text('30');
    });
  }
);
