import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';

describe('Integration | Component | one button', function () {
  setupComponentTest('one-button', {
    integration: true,
  });

  it('renders button which calls "onClick" action on click', async function () {
    const onClick = this.set('onClick', sinon.spy());
    this.render(hbs `{{#one-button onClick=onClick}}my button{{/one-button}}`);

    expect(onClick).to.be.not.called;
    expect(this.$().children()).to.have.class('one-button')
      .and.to.have.length(1);

    await click('.one-button');

    expect(onClick).to.be.calledOnce;
  });

  it('does not render spinner after click when handler returns non-promise thing', async function () {
    this.set('onClick', () => 1);
    this.render(hbs `{{#one-button onClick=onClick}}my button{{/one-button}}`);

    await click('.one-button');

    expect(this.$('.spin-spinner')).to.not.exist;
  });

  it('renders spinner and disables button after click when handler returns promise', async function () {
    let resolvePromise;
    this.set('onClick', () => new Promise((resolve) => resolvePromise = resolve));
    this.render(hbs `{{#one-button onClick=onClick}}my button{{/one-button}}`);

    await click('.one-button');

    expect(this.$('.spin-spinner')).to.exist;
    expect(this.$('.one-button')).to.be.disabled;

    resolvePromise();
    await wait();

    expect(this.$('.spin-spinner')).to.not.exist;
    expect(this.$('.one-button')).to.be.enabled;
  });

  it('renders spinner and disables button when "isPending" is true', async function () {
    this.render(hbs `{{#one-button isPending=true}}my button{{/one-button}}`);

    await click('.one-button');

    expect(this.$('.spin-spinner')).to.exist;
    expect(this.$('.one-button')).to.be.disabled;
  });

  it('does not disable button after click when handler returns promise and disableWhenPending is false',
    async function () {
      this.set('onClick', () => new Promise(() => {}));
      this.render(hbs `
        {{#one-button onClick=onClick disableWhenPending=false}}
          my button
        {{/one-button}}
      `);

      await click('.one-button');

      expect(this.$('.spin-spinner')).to.exist;
      expect(this.$('.one-button')).to.be.enabled;
    });

  it('does not disable button when "isPending" is true and disableWhenPending is false', async function () {
    this.render(hbs `
      {{#one-button isPending=true disableWhenPending=false}}
        my button
      {{/one-button}}
    `);

    await click('.one-button');

    expect(this.$('.spin-spinner')).to.exist;
    expect(this.$('.one-button')).to.be.enabled;
  });
});