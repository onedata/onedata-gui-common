import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Component | one-button', function () {
  setupRenderingTest();

  it('renders button which calls "onClick" action on click', async function () {
    const onClick = this.set('onClick', sinon.spy());
    await render(hbs `<OneButton @onClick={{onClick}}>my button</OneButton>`);

    expect(onClick).to.be.not.called;
    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('one-button');

    await click('.one-button');

    expect(onClick).to.be.calledOnce;
  });

  it('does not render spinner after click when handler returns non-promise thing', async function () {
    this.set('onClick', () => 1);
    await render(hbs `<OneButton @onClick={{onClick}}>my button</OneButton>`);

    await click('.one-button');

    expect(find('.spin-spinner')).to.not.exist;
  });

  it('renders spinner and disables button after click when handler returns promise', async function () {
    let resolvePromise;
    this.set('onClick', () => new Promise((resolve) => resolvePromise = resolve));
    await render(hbs `<OneButton @onClick={{onClick}}>my button</OneButton>`);

    await click('.one-button');

    expect(find('.spin-spinner')).to.exist;
    expect(find('.one-button').disabled).to.be.true;
    expect(find('.one-button')).to.has.class('pending');

    resolvePromise();
    await settled();

    expect(find('.spin-spinner')).to.not.exist;
    expect(find('.one-button').disabled).to.be.false;
  });

  it('renders spinner and disables button when "isPending" is true', async function () {
    await render(hbs `<OneButton @isPending={{true}}>my button</OneButton>`);

    await click('.one-button');

    expect(find('.spin-spinner')).to.exist;
    expect(find('.one-button').disabled).to.be.true;
  });

  it('does not disable button after click when handler returns promise and disableWhenPending is false',
    async function () {
      this.set('onClick', () => new Promise(() => {}));
      await render(hbs `
        <OneButton @onClick={{onClick}} @disableWhenPending={{false}}>
          my button
        </OneButton>
      `);

      await click('.one-button');

      expect(find('.spin-spinner')).to.exist;
      expect(find('.one-button').disabled).to.be.false;
    });

  it('does not disable button when "isPending" is true and disableWhenPending is false', async function () {
    await render(hbs `
      <OneButton @isPending={{true}} @disableWhenPending={{false}}>
        my button
      </OneButton>
    `);

    await click('.one-button');

    expect(find('.spin-spinner')).to.exist;
    expect(find('.one-button').disabled).to.be.false;
  });

  it('does not show spinner after click when handler returns promise and showSpinnerWhenPending is false',
    async function () {
      this.set('onClick', () => new Promise(() => {}));
      await render(hbs `
        <OneButton @onClick={{onClick}} @showSpinnerWhenPending={{false}}>
          my button
        </OneButton>
      `);

      await click('.one-button');

      expect(find('.spin-spinner')).to.not.exist;
      expect(find('.one-button').disabled).to.be.true;
    });

  it('does not show spinner when "isPending" is true and showSpinnerWhenPending is false', async function () {
    await render(hbs `
      <OneButton @isPending={{true}} @showSpinnerWhenPending={{false}}>
        my button
      </OneButton>
    `);

    await click('.one-button');

    expect(find('.spin-spinner')).to.not.exist;
    expect(find('.one-button').disabled).to.be.true;
  });

  it('adds passed class and "clickable" to element classname', async function () {
    const onClick = this.set('onClick', sinon.spy());
    await render(hbs `<OneButton class="hello">name</OneButton>`);

    expect(onClick).to.be.not.called;
    const button = this.element.children[0];

    for (const classname of ['one-button', 'hello', 'clickable']) {
      expect(button).to.have.class(classname);
    }
  });
});
