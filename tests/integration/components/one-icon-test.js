import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one-icon', function () {
  setupRenderingTest();

  it('renders element with oneicon class', async function () {
    await render(hbs`<OneIcon @icon="space" />`);
    console.log(this.element.outerHTML);
    expect(find('.one-icon')).to.have.class('oneicon-space');
  });

  it('changes oneicon class when icon is changed', async function () {
    this.set('icon', 'space');
    await render(hbs`<OneIcon @icon={{icon}} />`);
    this.set('icon', 'home');

    expect(find('.one-icon')).to.have.class('oneicon-home');
  });

  it('does not set color if color property is undefined', async function () {
    await render(hbs `<OneIcon @icon="space" />`);
    expect(find('.one-icon').getAttribute('style') || '').to.not.contain('color');
  });

  it('set color if color property is "red"', async function () {
    await render(hbs `<OneIcon @icon="space" @color="red" />`);
    expect(find('.one-icon').getAttribute('style') || '').to.contain('color: red');
  });

  it('reacts to color property change after initial render', async function () {
    this.set('color', undefined);

    await render(hbs `<OneIcon @icon="space" @color={{color}} />`);

    this.set('color', 'red');
    expect(find('.one-icon').getAttribute('style') || '').to.contain('color: red');
  });

  it('yields provided content', async function () {
    await render(hbs `<OneIcon>hello world</OneIcon>`);
    expect(this.element.textContent.trim()).to.equal('hello world');
  });

  it('renders with provided custom classes', async function () {
    await render(hbs `<OneIcon class="hello" />`);
    expect(find('.one-icon')).to.have.class('hello');
  });
});
