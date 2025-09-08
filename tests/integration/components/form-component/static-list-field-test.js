import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import StaticListField, { ListFieldComponent } from 'onedata-gui-common/utils/form-component/static-list-field';
import { layout, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@layout(hbs`<li>dummy component inner</li>`)
@tagName('')
class DummyComponentClass extends Component {}

@layout(hbs`<li>text: <span class="options-text">{{this.options.text}}</span></li>`)
@tagName('')
class DummyOptionsComponentClass extends Component {}

describe('Integration | Component | form-component/static-list-field', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    const field = StaticListField.create({ ownerSource: this.owner });
    this.helper = new Helper(this, field);
  });

  afterEach(function () {
    this.helper.destroy();
  });

  it('has class "static-list-field"', async function () {
    await this.helper.render();
    expect(find('.static-list-field')).to.exist;
  });

  it('renders list of text items from field.value property', async function () {
    this.helper.field.setProperties({
      value: ['one', 'two', 'three'],
    });

    await this.helper.render();

    const uls = this.helper.element.querySelectorAll('ul');
    expect([...uls]).to.have.lengthOf(1);
    const ul = uls[0];
    const lis = ul.querySelectorAll('li');
    expect([...lis]).to.have.lengthOf(3);
    expect(lis[0].textContent).to.contain('one');
    expect(lis[1].textContent).to.contain('two');
    expect(lis[2].textContent).to.contain('three');
  });

  it('renders list of text and component items from field.value property', async function () {
    this.owner.register('component:dummy-component', DummyComponentClass);
    this.helper.field.setProperties({
      value: ['one', new ListFieldComponent('dummy-component'), 'two'],
    });

    await this.helper.render();

    const ul = this.helper.element.querySelector('ul');
    const lis = ul.querySelectorAll('li');
    expect([...lis]).to.have.lengthOf(3);
    expect(lis[0].textContent).to.contain('one');
    expect(lis[1].outerHTML).to.contain('<li>dummy component inner</li>');
    expect(lis[2].textContent).to.contain('two');
  });

  it('renders custom component with options', async function () {
    this.owner.register('component:dummy-options-component', DummyOptionsComponentClass);
    this.helper.field.setProperties({
      value: [new ListFieldComponent('dummy-options-component', { text: 'hello world' })],
    });

    await this.helper.render();

    const ul = this.helper.element.querySelector('ul');
    const li = ul.querySelector('li .options-text');
    expect(li.textContent).to.contain('hello world');
  });
});

class Helper {
  /**
   * @param {Mocha.Context} mochaContext
   * @param {Utils.FormComponent.StaticListField}
   */
  constructor(mochaContext, field) {
    this.mochaContext = mochaContext;
    this.field = field;
  }
  async render() {
    this.mochaContext.set('field', this.field);
    await render(hbs `<FormComponent::StaticListField @field={{this.field}} />`);
  }
  get element() {
    return find('.static-list-field');
  }
  destroy() {
    this.field?.destroy();
  }
}
