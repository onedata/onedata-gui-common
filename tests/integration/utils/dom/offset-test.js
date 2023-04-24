import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Utility | dom/offset', function () {
  setupRenderingTest();

  it('returns element\'s offset', async function () {
    await render(hbs`<span></span>`);

    const span = find('span');
    const rect = span.getBoundingClientRect();
    expect(dom.offset(span)).to.deep.equal({
      top: rect.top + globals.window.pageYOffset,
      left: rect.left + globals.window.pageXOffset,
    });
  });
});
