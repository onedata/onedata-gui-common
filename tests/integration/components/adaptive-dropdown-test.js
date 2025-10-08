import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';
import { InfiniteScrollDropdownTestToolbox } from './infinite-scroll-dropdown-test';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { action } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

describe('Integration | Component | adaptive-dropdown', function () {
  setupRenderingTest();

  it('renders OneDropdown if number of options is below 50', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(49).map(String);

    await this.helper.render();

    this.helper.expectOneDropdown();
  });

  it('renders InfiniteScrollDropdown if number of options is at least 50', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(50).map(String);

    await this.helper.render();

    this.helper.expectInfiniteScrollDropdown();
  });

  it('renders InfiniteScrollDropdown when @options is a thenable which resolves to list with length at least 50',
    async function () {
      this.helper = new Helper(this);
      this.helper.renderContext.options = promiseObject(
        (async () => _.range(50).map(String))()
      );

      await this.helper.render();
      await settled();

      this.helper.expectInfiniteScrollDropdown();
    }
  );

  it('changes type of dropdown to InfiniteScroll if number of options increases', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(40).map(String);

    await this.helper.render();
    this.helper.expectOneDropdown();

    this.helper.renderContext.options = _.range(60).map(String);
    await waitForRender();
    this.helper.expectInfiniteScrollDropdown();
  });

  it('changes type of dropdown to OneDropdown if number of options decreases', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(60).map(String);

    await this.helper.render();
    this.helper.expectInfiniteScrollDropdown();

    this.helper.renderContext.options = _.range(40).map(String);
    await waitForRender();
    this.helper.expectOneDropdown();
  });

  it('preserves selected option when dropdown changes from OneDropdown to InfiniteScroll', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(40).map(String);

    await this.helper.render();
    await this.helper.infiniteToolbox.getDropdownHelper().selectOptionByText('12');
    await this.helper.infiniteToolbox.getDropdownHelper().close();
    this.helper.renderContext.options = _.range(60).map(String);
    await waitForRender();
    await this.helper.infiniteToolbox.initDropdownHelper();

    const selectedOption =
      await this.helper.infiniteToolbox.getDropdownHelper().getSelectedOptionText();
    expect(selectedOption).to.equal('12');
  });

  it('preserves selected option when dropdown changes from InfiniteScroll to OneDropdown', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(60).map(String);

    await this.helper.render();
    await this.helper.infiniteToolbox.getDropdownHelper().selectOptionByText('12');
    await this.helper.infiniteToolbox.getDropdownHelper().close();
    this.helper.renderContext.options = _.range(40).map(String);
    await waitForRender();
    await this.helper.infiniteToolbox.initDropdownHelper();

    const selectedOption =
      await this.helper.infiniteToolbox.getDropdownHelper().getSelectedOptionText();
    expect(selectedOption).to.equal('12');
  });

  it('adds custom triggerClass to InfiniteScroll component', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(60).map(String);
    this.helper.renderContext.triggerClass = 'hello-world';

    await this.helper.render();

    const trigger = this.helper.infiniteToolbox.getDropdownHelper().getTrigger();
    expect(trigger).to.have.class('infinite-scroll-dropdown-trigger');
    expect(trigger).to.have.class('hello-world');
  });

  it('adds custom dropdownClass to InfiniteScroll component', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(60).map(String);
    this.helper.renderContext.dropdownClass = 'hello-world';

    await this.helper.render();

    const optionsContainer =
      await this.helper.infiniteToolbox.getDropdownHelper().getOptionsContainer();
    expect(optionsContainer).to.have.class('infinite-scroll-dropdown');
    expect(optionsContainer).to.have.class('hello-world');
  });
});

class RenderContext {
  @tracked selected;
  @tracked searchEnabled;
  @tracked options = [];
  @tracked triggerClass;
  @tracked dropdownClass;

  @action
  onChange(option) {
    this.selected = option;
  }
}

class Helper {
  renderContext = new RenderContext();

  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.mochaContext.renderContext = this.renderContext;
    this.infiniteToolbox = new InfiniteScrollDropdownTestToolbox(mochaContext);
  }

  expectOneDropdown() {
    expect(find('.ember-basic-dropdown')).to.exist;
    expect(find('.infinite-scroll-dropdown')).to.not.exist;
  }

  expectInfiniteScrollDropdown() {
    expect(find('.ember-basic-dropdown.infinite-scroll-dropdown')).to.exist;
  }

  async render() {
    await render(hbs`
      <AdaptiveDropdown
        @renderInPlace={{true}}
        @searchEnabled={{this.renderContext.searchEnabled}}
        @options={{this.renderContext.options}}
        @selected={{this.renderContext.selected}}
        @triggerClass={{this.renderContext.triggerClass}}
        @dropdownClass={{this.renderContext.dropdownClass}}
        @onChange={{this.renderContext.onChange}}
        as |option|
      >
        {{option}}
      </AdaptiveDropdown>
    `);
  }
}
