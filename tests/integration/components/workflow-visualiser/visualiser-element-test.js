import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';

describe('Integration | Component | workflow visualiser/visualiser element', function () {
  setupRenderingTest();

  it('has class "workflow-visualiser-element', async function () {
    await render(hbs `{{workflow-visualiser/visualiser-element}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('workflow-visualiser-element');
  });

  it('has not specified "data-visualiser-element-id" attribute when "visualiserElement" is undefined',
    async function () {
      await render(hbs `{{workflow-visualiser/visualiser-element}}`);

      expect(find('.workflow-visualiser-element'))
        .to.not.have.attr('data-visualiser-element-id');
    });

  it('has specified "data-visualiser-element-id" attribute when "visualiserElement" is specified',
    async function () {
      const elementId = '1234';
      this.set('visualiserElement', VisualiserElement.create({
        id: elementId,
      }));

      await render(hbs `{{workflow-visualiser/visualiser-element elementModel=visualiserElement}}`);

      expect(find('.workflow-visualiser-element'))
        .to.have.attr('data-visualiser-element-id', elementId);
    });

  ['view', 'edit'].forEach(mode => {
    const modeClass = `mode-${mode}`;

    it(`has "${modeClass}" class when in "visualiserElement.mode" is "${mode}"`, async function () {
      this.set('visualiserElement', VisualiserElement.create({
        mode,
      }));

      await render(hbs `{{workflow-visualiser/visualiser-element elementModel=visualiserElement}}`);

      expect(find('.workflow-visualiser-element')).to.have.class(modeClass);
    });
  });
});
