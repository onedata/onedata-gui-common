import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@ember/object';

describe('Integration | Component | workflow visualiser/visualiser element renderer', function () {
  setupRenderingTest();

  it('renders nothing when lane element is not defined', async function () {
    await render(hbs `{{workflow-visualiser/visualiser-element-renderer}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders lane element using component specified by element\'s "renderer" field', async function () {
    this.set('elementModel', { renderer: 'test-component' });

    await render(hbs `{{workflow-visualiser/visualiser-element-renderer
      elementModel=elementModel
    }}`);

    expect(this.$('.test-component')).to.have.length(1);
  });

  it('passes lane element instance to the renderer lane element component', async function () {
    const elementModel = this.set('elementModel', { renderer: 'test-component' });

    await render(hbs `{{workflow-visualiser/visualiser-element-renderer
      elementModel=elementModel
    }}`);

    const renderedComponent = this.$('.test-component')[0].componentInstance;
    expect(get(renderedComponent, 'elementModel')).to.equal(elementModel);
  });
});
