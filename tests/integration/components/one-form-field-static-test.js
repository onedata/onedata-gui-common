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
      {{one-form-field-static field=field value=value}}
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
      {{one-form-field-static field=field}}
    `);

    expect(find('.form-control-static')).to.have.class('field-one');
  });
});
