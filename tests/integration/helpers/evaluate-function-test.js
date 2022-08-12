import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, settled } from '@ember/test-helpers';

describe('Integration | Helper | evaluate-function', function () {
  setupRenderingTest('evaluate-function');

  it('evaluates function without arguments', async function () {
    this.set('func', () => 'example');

    await render(hbs`{{evaluate-function func}}`);

    expect(this.element).to.have.trimmed.text('example');
  });

  it('evaluates function with arguments', async function () {
    this.set('func', (a, b) => a + b);

    await render(hbs`{{evaluate-function func 2 3}}`);

    expect(this.element).to.have.trimmed.text('5');
  });

  it('reactively recalculates function result', async function () {
    this.setProperties({
      func: (a, b) => a + b,
      a: 2,
      b: 3,
    });

    await render(hbs`{{evaluate-function func a b}}`);

    expect(this.element).to.have.trimmed.text('5');

    this.set('func', (a, b) => a * b);
    await settled();
    expect(this.element).to.have.trimmed.text('6');

    this.set('a', 4);
    await settled();
    expect(this.element).to.have.trimmed.text('12');
  });

  it('does not return anything when function is undefined', async function () {
    await render(hbs`{{evaluate-function func a b}}`);

    expect(this.element).to.have.trimmed.text('');
  });
});
