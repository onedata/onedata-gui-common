import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one-label-tip', function () {
  setupRenderingTest();

  it('renders with one-label-tip class and passed classname', async function () {
    await render(hbs`
      <OneLabelTip class="hello world" />
    `);

    const element = find('.one-label-tip');
    expect(element).to.exist;
    expect(element).to.have.class('hello');
    expect(element).to.have.class('world');
  });

  it('renders sign-question-rounded icon by default', async function () {
    await render(hbs`
      <OneLabelTip />
    `);

    const icon = find('.one-label-tip .one-icon');
    expect(icon).to.have.class('oneicon-sign-question-rounded');
  });

  it('renders passed icon', async function () {
    await render(hbs`
      <OneLabelTip @icon="space" />
    `);

    const icon = find('.one-label-tip .one-icon');
    expect(icon).to.have.class('oneicon-space');
  });

  it('shows tooltip with text provided in title on hover', async function () {
    this.set('title', 'hello world');
    await render(hbs`
      <OneLabelTip @title={{this.title}} />
    `);

    await hoverTrigger();

    const tooltip = findOpenedTooltip();
    expect(tooltip).to.exist;
    expect(tooltip.textContent.trim()).to.equal(this.title);
  });

  it('changes tooltip text provied by title property', async function () {
    this.set('title', 'hello world');
    await render(hbs`
      <OneLabelTip @title={{this.title}} />
    `);

    await hoverTrigger();

    const tooltip = findOpenedTooltip();
    expect(tooltip.textContent.trim()).to.equal('hello world');
    this.set('title', 'foo bar');
    expect(tooltip.textContent.trim()).to.equal('foo bar');

  });

  it('shows tooltip with content provided in yielded content on hover', async function () {
    await render(hbs`
      <OneLabelTip>
        <strong>foo bar</strong>
      </OneLabelTip>
    `);

    await hoverTrigger();

    const tooltip = findOpenedTooltip();
    expect(tooltip).to.exist;
    const tooltipInner = tooltip.querySelector('.tooltip-inner');
    expect(tooltipInner.innerHTML).to.match(/\s*<strong>\s*foo bar\s*<\/strong>\s*/);
  });

  it('shows tooltip with provided position on hover', async function () {
    await render(hbs`
      <OneLabelTip @title="hello world" @placement="bottom" />
    `);

    await hoverTrigger();

    const tooltip = findOpenedTooltip();
    expect(tooltip).to.have.class('bottom');
  });

  it('shows tooltip with provided classname on hover', async function () {
    await render(hbs`
      <OneLabelTip @title="hello world" @tooltipClass="foo bar" />
    `);

    await hoverTrigger();

    const tooltip = findOpenedTooltip();
    expect(tooltip).to.have.class('foo');
    expect(tooltip).to.have.class('bar');
  });

  it('sets desired triggers on tooltip', async function () {
    await render(hbs`
      <OneLabelTip @title="hello world" @triggerEvents="click" />
    `);

    await hoverTrigger();
    expect(findOpenedTooltip()).to.not.exist;
    await clickTrigger();
    expect(findOpenedTooltip()).to.exist;
  });
});

function findOpenedTooltip() {
  return find('.tooltip.in');
}

async function hoverTrigger() {
  await triggerEvent('.one-label-tip .one-icon', 'mouseenter');
}

async function clickTrigger() {
  await triggerEvent('.one-label-tip .one-icon', 'click');
}
