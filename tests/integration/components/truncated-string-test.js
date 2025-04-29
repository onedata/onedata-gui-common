import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | truncated-string', function () {
  setupRenderingTest();

  it('renders with passed classname and standard classnames', async function () {
    await render(hbs`<TruncatedString class="hello">short text</TruncatedString>`);
    const element = find('.hello');
    expect(element, 'truncated string element').to.exist;
    for (const classname of ['truncated-string', 'truncate']) {
      expect(element).to.have.class(classname);
    }
  });

  it('does not show tooltip, when text is fully visible', async function () {
    await render(hbs `
      <div style="min-width: 500px">
        <TruncatedString>short text</TruncatedString>
      </div>
    `);

    await triggerEvent('.truncated-string', 'mouseenter');
    expect(globals.document.querySelector('.tooltip.in')).to.not.exist;
  });

  it('shows tooltip with full text, when text is not fully visible', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        <TruncatedString>{{longText}}</TruncatedString>
      </div>
    `);

    await triggerEvent('.truncated-string', 'mouseenter');
    const tooltip = find('.tooltip.in');
    expect(tooltip, '.tooltip.in element').to.exist;
    expect(tooltip.textContent.trim()).to.equal(longText);
  });

  it('does not show tooltip, when text isTooltipDisabled is true', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        <TruncatedString @isTooltipDisabled={{true}}>{{longText}}</TruncatedString>
      </div>
    `);

    await triggerEvent('.truncated-string', 'mouseenter');
    const tooltip = find('.tooltip.in');
    expect(tooltip, '.tooltip.in element').to.not.exist;
  });

  it('shows custom tooltip text if passed', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    const customTooltipText = 'hello world custom tooltip';
    this.setProperties({
      longText,
      customTooltipText,
    });

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        <TruncatedString @customTooltipText={{this.customTooltipText}}>
          {{longText}}
        </TruncatedString>
      </div>
    `);

    await triggerEvent('.truncated-string', 'mouseenter');
    const tooltip = find('.tooltip.in');
    expect(tooltip.textContent.trim()).to.equal(this.customTooltipText);
  });

  it('removes tooltip element from DOM after mouse leave', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        <TruncatedString>{{longText}}</TruncatedString>
      </div>
    `);

    const findTooltip =
      () => find('.tooltip');
    await triggerEvent('.truncated-string', 'mouseenter');
    expect(findTooltip()).to.exist;
    await triggerEvent('.truncated-string', 'mouseleave');
    expect(findTooltip()).to.not.exist;
  });

  it('uses passed tooltipPlacement in tooltip rendering', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        <TruncatedString @tooltipPlacement="bottom">{{longText}}</TruncatedString>
      </div>
    `);

    await triggerEvent('.truncated-string', 'mouseenter');
    expect(find('.tooltip')).to.have.class('bottom');
  });

  it('has top tooltipPlacement by default', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        <TruncatedString>{{longText}}</TruncatedString>
      </div>
    `);

    await triggerEvent('.truncated-string', 'mouseenter');
    expect(find('.tooltip')).to.have.class('top');
  });
});
