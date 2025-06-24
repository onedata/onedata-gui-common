import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import OneTooltipHelper from '../../helpers/one-tooltip';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Component | one-tooltip', function () {
  setupRenderingTest();

  it('shows tooltip with text provided in title on hover', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} />
      </div>
    `);

    // when
    await helper.open();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.exist;
    expect(tooltip.textContent.trim()).to.equal(this.title);
  });

  it('shows tooltip with text provided in block on hover', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip>{{this.title}}</OneTooltip>
      </div>
    `);

    // when
    await helper.open();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.exist;
    expect(tooltip.textContent.trim()).to.equal(this.title);
  });

  it('hides tooltip with text provided in title on mouseleave', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} />
      </div>
    `);
    await helper.open();

    // when
    await helper.close();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.not.exist;
  });

  it('shows tooltip with text provided in title when @visible is true', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');

    // when
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @visible={{true}} @triggerEvents="" />
      </div>
    `);

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.exist;
  });

  it('does not show tooltip when @visible is false', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');

    // when
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @visible={{false}} @triggerEvents="" />
      </div>
    `);

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.not.exist;
  });

  it('does not show tooltip on hover when @visible is false', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');

    // when
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @visible={{false}} @triggerEvents="" />
      </div>
    `);
    await helper.open();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.not.exist;
  });

  it('hides tooltip when @visible is changed from true to false', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    this.set('isVisible', true);
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @visible={{this.isVisible}} @triggerEvents="" />
      </div>
    `);

    // when
    this.set('isVisible', false);
    await waitForRender();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.not.exist;
  });

  it('shows tooltip when @visible is changed from false to true', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    this.set('isVisible', false);
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @visible={{this.isVisible}} @triggerEvents="" />
      </div>
    `);

    // when
    this.set('isVisible', true);

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.exist;
  });

  it('opens tooltip with custom "click" triggerEvents', async function () {
    // given
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @triggerEvents="click" />
      </div>
    `);

    // when
    await helper.triggerEvent('click');

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.exist;
  });

  it('hides tooltip when container is scrolled', async function () {
    // given
    const scrollStateService = lookupService(this, 'scrollState');
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @triggerEvents="click" @hideOnScroll={{true}} />
      </div>
    `);
    await helper.triggerEvent('click');

    // when
    scrollStateService.scrollOccurred(new Event('scroll'));
    await waitForRender();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.not.exist;
  });

  it('handles close on scroll tooltip is hidden and container is scrolled', async function () {
    // given
    const scrollStateService = lookupService(this, 'scrollState');
    const helper = new OneTooltipHelper('#tooltip-container');
    this.set('title', 'hello world');
    await render(hbs`
      <div id="tooltip-container">
        <OneTooltip @title={{this.title}} @hideOnScroll={{true}} />
      </div>
    `);

    // when
    scrollStateService.scrollOccurred(new Event('scroll'));
    await waitForRender();

    // then
    const tooltip = helper.getTooltip();
    expect(tooltip).to.not.exist;
  });
});
