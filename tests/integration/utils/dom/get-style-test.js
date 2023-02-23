import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/get-style', function () {
  setupRenderingTest();

  it('returns value based on inline style', async function () {
    await render(hbs`<span style="font-size: 30px;"></span>`);

    expect(dom.getStyle(find('span'), 'fontSize')).to.equal('30px');
  });

  it('returns value based on parent and child styles', async function () {
    await render(hbs`<p style="font-size: 30px;">
      <span style="font-size: 200%;"></span>
    </p>`);

    expect(dom.getStyle(find('span'), 'fontSize')).to.equal('60px');
  });
});
