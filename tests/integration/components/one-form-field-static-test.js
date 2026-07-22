import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one-form-field-static', function () {
  setupRenderingTest();

  it('renders with value', async function () {
    this.set('field', {
      name: 'one',
      type: 'static',
    });
    this.set('value', 'hello');
    await render(hbs `
      <OneFormFieldStatic @field={{field}} @value={{value}} />
    `);

    const fieldElem = find('.form-control-static');
    expect(fieldElem).to.exist;
    expect(fieldElem.textContent).to.match(new RegExp('hello'));
  });

  it('has a class with field name', async function () {
    this.set('field', {
      name: 'one',
      type: 'static',
    });
    await render(hbs `
      <OneFormFieldStatic @field={{field}} />
    `);

    expect(find('.form-control-static')).to.have.class('field-one');
  });

  it('renders rightText with spacing by default', async function () {
    this.set('fieldWithSpacing', {
      name: 'one',
      type: 'static',
      rightText: '.example.com',
    });
    this.set('value', 'provider');

    await render(hbs `
      <OneFormFieldStatic @field={{fieldWithSpacing}} @value={{value}} />
    `);

    expect(find('.field-one').textContent).to.contain('provider .example.com');
  });

  it('renders rightText with spacing when noRightTextSpacing=true', async function () {
    this.set('fieldWithoutSpacing', {
      name: 'two',
      type: 'static',
      rightText: '.example.com',
      noRightTextSpacing: true,
    });
    this.set('value', 'provider');

    await render(hbs `
      <OneFormFieldStatic @field={{fieldWithoutSpacing}} @value={{value}} />
    `);

    expect(find('.field-two').textContent).to.contain('provider.example.com');
  });
});
