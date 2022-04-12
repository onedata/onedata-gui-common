import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | bezier curve', function () {
  setupRenderingTest();

  it('renders', async function () {
    await render(hbs `{{bezier-curve x1=100 y1=100 x2=200 y2=100 curveFactor=1}}`);
    expect(find('path').getAttribute('d')).to.be.equal('M 100 100 Q 150 50, 200 100');
  });
});
