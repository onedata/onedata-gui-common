import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | hr label', function () {
  setupRenderingTest();

  it('renders provided text', async function () {
    await render(hbs `{{#hr-label}}some text{{/hr-label}}`);

    expect(find('.hr-label')).to.exist;
    expect(find('.hr-label').textContent).to.contain('some text');
  });
});
