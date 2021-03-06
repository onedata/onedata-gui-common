import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@ember/object';

describe('Integration | Component | workflow visualiser/visualiser element renderer', function () {
  setupComponentTest('workflow-visualiser/visualiser-element-renderer', {
    integration: true,
  });

  it('renders nothing when lane element is not defined', function () {
    this.render(hbs `{{workflow-visualiser/visualiser-element-renderer}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders lane element using component specified by element\'s "renderer" field', function () {
    this.set('element', { renderer: 'test-component' });

    this.render(hbs `{{workflow-visualiser/visualiser-element-renderer elementModel=element}}`);

    expect(this.$('.test-component')).to.have.length(1);
  });

  it('passes lane element instance to the renderer lane element component', function () {
    const element = this.set('element', { renderer: 'test-component' });

    this.render(hbs `{{workflow-visualiser/visualiser-element-renderer elementModel=element}}`);

    const renderedComponent = this.$('.test-component')[0].componentInstance;
    expect(get(renderedComponent, 'elementModel')).to.equal(element);
  });
});
