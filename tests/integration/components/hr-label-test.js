import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | hr label', function () {
  setupRenderingTest();

  it('renders provided text', async function () {
    await render(hbs `{{#hr-label}}some text{{/hr-label}}`);

    expect(this.$('.hr-label')).to.exist;
    expect(this.$('.hr-label')).to.contain('some text');
  });
});
