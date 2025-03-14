import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Helper | is-empty-object', function () {
  setupRenderingTest();

  it('returns true for object without properties', async function () {
    this.set('object', {});

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.equal('true');
  });

  it('returns true for null', async function () {
    this.set('object', null);

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.equal('true');
  });

  it('returns true for undefined', async function () {
    this.set('object', undefined);

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.equal('true');
  });

  it('returns false for object with some properties', async function () {
    this.set('object', { hello: 1 });

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });

  it('returns false for zero number', async function () {
    this.set('object', 0);

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });

  it('returns false for non-zero number', async function () {
    this.set('object', 1);

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });

  it('returns false for empty string', async function () {
    this.set('object', '');

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });

  it('returns false for non-empty string', async function () {
    this.set('object', 'hello');

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });

  it('returns false for "false" boolean', async function () {
    this.set('object', false);

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });

  it('returns false for "true" boolean', async function () {
    this.set('object', false);

    await render(hbs`{{#if (is-empty-object object)}}true{{/if}}`);

    expect(this.element.textContent.trim()).to.not.equal('true');
  });
});
