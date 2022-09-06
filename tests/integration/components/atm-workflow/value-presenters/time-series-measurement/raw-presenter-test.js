import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

describe('Integration | Component | atm workflow/value presenters/time series measurement/raw presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "raw-presenter" and "time-series-measurement-raw-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/raw-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('raw-presenter')
      .and.to.have.class('time-series-measurement-raw-presenter');
  });

  it('presents passed value', async function () {
    this.set('value', {
      tsName: 'series1',
      timestamp: 1659533491,
      value: 30,
    });
    await render(hbs`{{atm-workflow/value-presenters/time-series-measurement/raw-presenter
      value=value
    }}`);

    const expectedValue = `{
  "tsName": "series1",
  "timestamp": 1659533491,
  "value": 30
}`;
    expect(find('.raw-presenter textarea')).to.have.value(expectedValue);
  });
});
