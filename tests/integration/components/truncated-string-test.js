import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import globals from 'onedata-gui-common/utils/globals';
import sinon from 'sinon';
import { htmlSafe } from '@ember/template';

const longText = 'Very very very very very very very very very very very very long text';

describe('Integration | Component | truncated-string', function () {
  setupRenderingTest();

  it('renders with passed classname and standard classnames', async function () {
    await renderComponent(this, { textContent: 'short text', classname: 'hello' });

    const element = find('.hello');
    expect(element, 'truncated string element').to.exist;
    for (const classname of ['truncated-string', 'truncate']) {
      expect(element).to.have.class(classname);
    }
  });

  it('does not show tooltip, when text is fully visible', async function () {
    await renderComponent(this, { textContent: longText, isContainerTruncated: false });
    await hoverTruncatedString();

    expect(globals.document.querySelector('.tooltip.in')).to.not.exist;
  });

  it('shows tooltip with full text, when text is not fully visible', async function () {
    await renderComponent(this, { textContent: longText });
    await hoverTruncatedString();

    const tooltip = find('.tooltip.in');
    expect(tooltip, '.tooltip.in element').to.exist;
    expect(tooltip.textContent.trim()).to.equal(longText);
  });

  it('does not show tooltip, when text isTooltipDisabled is true', async function () {
    await renderComponent(this, { textContent: longText, isTooltipDisabled: true });
    await hoverTruncatedString();

    const tooltip = find('.tooltip.in');
    expect(tooltip, '.tooltip.in element').to.not.exist;
  });

  it('shows custom tooltip text if passed', async function () {
    const customTooltipText = 'hello world custom tooltip';

    await renderComponent(this, { textContent: longText, customTooltipText });
    await hoverTruncatedString();

    const tooltip = find('.tooltip.in');
    expect(tooltip.textContent.trim()).to.equal(customTooltipText);
  });

  it('removes tooltip element from DOM after mouse leave', async function () {
    await renderComponent(this, { textContent: longText });

    const findTooltip =
      () => find('.tooltip');
    await hoverTruncatedString();
    expect(findTooltip()).to.exist;
    await triggerEvent('.truncated-string', 'mouseleave');
    expect(findTooltip()).to.not.exist;
  });

  it('uses passed tooltipPlacement in tooltip rendering', async function () {
    await renderComponent(this, { textContent: longText, tooltipPlacement: 'bottom' });
    await hoverTruncatedString();

    expect(find('.tooltip')).to.have.class('bottom');
  });

  it('has top tooltipPlacement by default', async function () {
    await renderComponent(this, { textContent: longText });
    await hoverTruncatedString();

    expect(find('.tooltip')).to.have.class('top');
  });

  it('uses custom tooltip class if provided', async function () {
    const tooltipClass = 'hello-world';

    await renderComponent(this, { textContent: longText, tooltipClass });
    await hoverTruncatedString();

    expect(find('.tooltip')).to.have.class(tooltipClass);
  });

  it('calls passed tooltipOnShown callback after showing tooltip', async function () {
    const tooltipOnShown = sinon.spy();
    await renderComponent(this, { textContent: longText, tooltipOnShown });

    expect(tooltipOnShown).to.have.been.not.called;
    await hoverTruncatedString();
    expect(tooltipOnShown).to.have.been.calledOnce;
  });

  it('does not call passed tooltipOnShown callback after hovering tooltip when tooltip is disabled',
    async function () {
      const tooltipOnShown = sinon.spy();
      await renderComponent(this, { textContent: longText, isTooltipDisabled: true });

      await hoverTruncatedString();
      expect(tooltipOnShown).to.have.been.not.called;
    });
});

async function renderComponent(mochaContext, {
  textContent,
  classname,
  isContainerTruncated = true,
  isTooltipDisabled,
  customTooltipText,
  tooltipPlacement,
  tooltipOnShown,
  tooltipClass,
}) {
  const containerStyle = htmlSafe(
    isContainerTruncated ? 'min-width: 50px; max-width: 50px;' : 'min-width: 500px'
  );

  mochaContext.setProperties({
    textContent,
    classname,
    isTooltipDisabled,
    customTooltipText,
    tooltipPlacement,
    tooltipOnShown,
    tooltipClass,
    containerStyle,
  });

  await render(hbs `
    <div style={{containerStyle}}>
      <TruncatedString
        @isTooltipDisabled={{this.isTooltipDisabled}}
        @customTooltipText={{this.customTooltipText}}
        @tooltipPlacement={{this.tooltipPlacement}}
        @tooltipOnShown={{this.tooltipOnShown}}
        @tooltipClass={{this.tooltipClass}}
        class={{this.classname}}
      >{{textContent}}</TruncatedString>
    </div>
  `);
}

async function hoverTruncatedString() {
  await triggerEvent('.truncated-string', 'mouseenter');
}
