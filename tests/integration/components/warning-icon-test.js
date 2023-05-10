import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | warning-icon', function () {
  setupRenderingTest();

  it('does not have any tooltip then "tooltipText" was not specified', async function () {
    await render(hbs`{{warning-icon}}`);

    const tooltipHelper = new OneTooltipHelper('.warning-icon-image');
    expect(await tooltipHelper.hasTooltip()).to.be.false;
  });

  it('has a tooltip then "tooltipText" was specified', async function () {
    await render(hbs`{{warning-icon tooltipText="abc"}}`);

    const tooltipHelper = new OneTooltipHelper('.warning-icon-image');
    expect(await tooltipHelper.getText()).to.equal('abc');
  });
});
