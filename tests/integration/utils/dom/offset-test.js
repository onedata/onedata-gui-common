import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/offset', function () {
  setupRenderingTest();

  it('returns element\'s offset', async function () {
    await render(hbs`<span></span>`);

    const span = find('span');
    const rect = span.getBoundingClientRect();
    expect(dom.offset(span)).to.deep.equal({
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    });
  });
});
