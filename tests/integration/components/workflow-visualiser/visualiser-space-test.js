import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import _ from 'lodash';
import $ from 'jquery';

describe('Integration | Component | workflow visualiser/visualiser space', function () {
  setupRenderingTest();

  it('has classes "workflow-visualiser-space" and "workflow-visualiser-element"', async function () {
    await render(hbs `{{workflow-visualiser/visualiser-space}}`);

    expect(this.element.children).to.have.length(1);
    expect($(this.element.children[0]))
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

        expect(find('.workflow-visualiser-space').getAttribute(htmlAttrForSibling))
          .to.be.null;
      });

    it(`has specified "${htmlAttrForSibling}" attribute when "${siblingName}" is specified`, async function () {
      const elementId = '1234';
      this.set('space', VisualiserSpace.create({
        [siblingName]: VisualiserRecord.create({
          id: elementId,
        }),
      }));

      await render(hbs `{{workflow-visualiser/visualiser-space elementModel=space}}`);

      expect(find('.workflow-visualiser-space').getAttribute(htmlAttrForSibling))
        .to.equal(elementId);
    });
  });
});
