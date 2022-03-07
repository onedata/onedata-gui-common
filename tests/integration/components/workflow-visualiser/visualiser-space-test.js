import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import _ from 'lodash';

describe('Integration | Component | workflow visualiser/visualiser space', function () {
  setupRenderingTest();

  it('has classes "workflow-visualiser-space" and "workflow-visualiser-element"', async function () {
    await render(hbs `{{workflow-visualiser/visualiser-space}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0))
      .to.have.class('workflow-visualiser-space')
      .and.to.have.class('workflow-visualiser-element');
  });

  ['before', 'after'].forEach(elementSuffix => {
    const siblingName = `element${_.upperFirst(elementSuffix)}`;
    const htmlAttrForSibling = `data-element-${elementSuffix}-id`;

    it(`has not specified "${htmlAttrForSibling}" attribute when "${siblingName}" is undefined`,
      async function () {
        this.set('space', VisualiserSpace.create({
          [siblingName]: undefined,
        }));

        await render(hbs `{{workflow-visualiser/visualiser-space elementModel=space}}`);

        expect(this.$('.workflow-visualiser-space')).to.not.have.attr(htmlAttrForSibling);
      });

    it(`has specified "${htmlAttrForSibling}" attribute when "${siblingName}" is specified`, async function () {
      const elementId = '1234';
      this.set('space', VisualiserSpace.create({
        [siblingName]: VisualiserRecord.create({
          id: elementId,
        }),
      }));

      await render(hbs `{{workflow-visualiser/visualiser-space elementModel=space}}`);

      expect(this.$('.workflow-visualiser-space'))
        .to.have.attr(htmlAttrForSibling, elementId);
    });
  });
});
