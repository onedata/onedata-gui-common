import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, triggerEvent } from 'ember-native-dom-helpers';
import $ from 'jquery';

describe('Integration | Component | remove icon', function () {
  setupComponentTest('remove-icon', {
    integration: true
  });

  it('has class "remove-icon"', function () {
      this.render(hbs `{{remove-icon}}`);

      expect(this.$('.remove-icon')).to.exist;
    }),

    it('renders proper icon', function () {
      this.render(hbs `{{remove-icon}}`);

      expect(this.$('.one-icon')).to.have.class('oneicon-checkbox-filled-x');
    });

  it('has "enabled" class if not disabled', function () {
    this.render(hbs `{{remove-icon}}`);

    expect(this.$('.remove-icon')).to.have.class('enabled');
  });

  it('has "disabled" class if disabled', function () {
    this.render(hbs `{{remove-icon isDisabled=true}}`);

    expect(this.$('.remove-icon')).to.have.class('disabled');
  });

  it('handles click event', function () {
    const clickHandler = sinon.spy();
    this.on('click', clickHandler);

    this.render(hbs `{{remove-icon onClick=(action "click")}} isDisabled=true`);

    return click('.remove-icon')
      .then(() => expect(clickHandler).to.not.beCalled);
  });

  it('does not react to click when disabled', function () {
    const clickHandler = sinon.spy();
    this.on('click', clickHandler);

    this.render(hbs `{{remove-icon onClick=(action "click")}}`);

    return click('.remove-icon')
      .then(() => expect(clickHandler).to.be.calledOnce);
  });

  it('shows tooltip if tooltipText property is not empty', function () {
    const tooltipText = 'Tip text';
    this.set('tooltipText', tooltipText);

    this.render(hbs `{{remove-icon tooltipText=tooltipText}}`);

    return triggerEvent('.remove-icon', 'mouseenter')
      .then(() => expect($('.tooltip.in').text()).to.contain(tooltipText));
  });

  it('does not show tooltip if tooltipText property is empty', function () {
    this.render(hbs `{{remove-icon}}`);

    return triggerEvent('.remove-icon', 'mouseenter')
      .then(() => expect($('.tooltip.in')).to.not.exist);
  });
});
