import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | remove icon', function () {
  setupRenderingTest();

  it('has class "remove-icon"', async function () {
    await render(hbs `{{remove-icon}}`);

    expect(find('.remove-icon')).to.exist;
  });

  it('renders proper icon', async function () {
    await render(hbs `{{remove-icon}}`);

    expect(find('.one-icon')).to.have.class('oneicon-checkbox-filled-x');
  });

  it('has "enabled" class if not disabled', async function () {
    await render(hbs `{{remove-icon}}`);

    expect(find('.remove-icon')).to.have.class('enabled');
  });

  it('has "disabled" class if disabled', async function () {
    await render(hbs `{{remove-icon isDisabled=true}}`);

    expect(find('.remove-icon')).to.have.class('disabled');
  });

  it('handles click event', async function () {
    const clickHandler = sinon.spy();
    this.set('clickHandler', clickHandler);

    await render(hbs `{{remove-icon onClick=(action clickHandler)}}`);

    return click('.remove-icon')
      .then(() => expect(clickHandler).to.be.calledOnce);
  });

  it('does not react to click when disabled', async function () {
    const clickHandler = sinon.spy();
    this.set('click', clickHandler);

    await render(hbs `{{remove-icon onClick=(action click) isDisabled=true}}`);

    return click('.remove-icon')
      .then(() => expect(clickHandler).to.be.not.called);
  });

  it('shows tooltip if tooltipText property is not empty', async function () {
    const tooltipText = 'Tip text';
    this.set('tooltipText', tooltipText);

    await render(hbs `{{remove-icon tooltipText=tooltipText}}`);

    return triggerEvent('.remove-icon', 'mouseenter')
      .then(() =>
        expect(document.querySelector('.tooltip.in').textContent)
        .to.contain(tooltipText)
      );
  });

  it('does not show tooltip if tooltipText property is empty', async function () {
    await render(hbs `{{remove-icon}}`);

    return triggerEvent('.remove-icon', 'mouseenter')
      .then(() => expect(document.querySelector('.tooltip.in')).to.not.exist);
  });
});
