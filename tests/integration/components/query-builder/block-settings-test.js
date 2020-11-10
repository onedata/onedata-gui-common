import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { click, waitUntil } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import $ from 'jquery';
import { get } from '@ember/object';
import sleep from 'onedata-gui-common/utils/sleep';

describe('Integration | Component | query builder/block settings', function () {
  setupComponentTest('query-builder/block-settings', {
    integration: true,
  });

  it('does not show block selector when "open" is false', async function () {
    this.set('queryBlock', NotOperatorQueryBlock.create());

    this.render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=false
      triggerSelector="#x"
    }}</div>`);

    expect($('.webui-popover')).to.not.exist;
  });

  it('shows block selector when "open" is true', async function () {
    this.set('queryBlock', NotOperatorQueryBlock.create());

    this.render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=true
      triggerSelector="#x"
    }}</div>`);

    expect($('.webui-popover')).to.exist.and.not.have.css('display', 'none');

    const blockSelector = $('.query-builder-block-selector');
    expect(blockSelector).to.exist;
    expect(blockSelector).to.have.class('edit-block-selector');
  });

  it('shows block selector (operator block variant)', async function () {
    this.set('queryBlock', NotOperatorQueryBlock.create());

    this.render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=true
      triggerSelector="#x"
    }}</div>`);

    const blockSelector = $('.query-builder-block-selector');
    expect(blockSelector).to.exist;
    // only operator blocks have "change to" section
    expect(blockSelector.find('.change-to-section')).to.exist;
  });

  it('shows block selector (condition block variant)', async function () {
    this.set('queryBlock', ConditionQueryBlock.create());

    this.render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=true
      triggerSelector="#x"
    }}</div>`);

    const blockSelector = $('.query-builder-block-selector');
    expect(blockSelector).to.exist;
    // condition blocks don't have "change to" section
    expect($('.change-to-section')).to.not.exist;
  });

  it(
    'notifies about selected "surround" operator and then closes block selector',
    async function () {
      const {
        queryBlock,
        replaceSpy,
        closeSpy,
      } = this.setProperties({
        queryBlock: NotOperatorQueryBlock.create(),
        replaceSpy: sinon.spy(),
        closeSpy: sinon.stub().callsFake(() => this.set('open', false)),
        open: true,
      });

      this.render(hbs `<div id="x">{{query-builder/block-settings
        queryBlock=queryBlock
        open=true
        triggerSelector="#x"
        onBlockReplace=replaceSpy
        onSettingsClose=closeSpy
      }}</div>`);

      await click('.surround-section .operator-and');
      await waitUntil(
        () => $('.webui-popover').css('display') === 'none', { timeout: 1000 }
      );

      expect($('.webui-popover').css('display')).to.equal('none');
      const blockMatcher = sinon.match.instanceOf(AndOperatorQueryBlock)
        .and(sinon.match.has('operands', [queryBlock]));
      expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      expect(closeSpy).to.be.calledOnce;
    }
  );

  it(
    'notifies about selected "change to" operator and then closes block selector',
    async function () {
      const {
        queryBlock,
        replaceSpy,
        closeSpy,
      } = this.setProperties({
        queryBlock: NotOperatorQueryBlock.create(),
        replaceSpy: sinon.spy(),
        closeSpy: sinon.stub().callsFake(() => this.set('open', false)),
        isShown: true,
      });
      const condition = new ConditionQueryBlock();
      queryBlock.addOperand(condition);

      this.render(hbs `<div id="x">{{query-builder/block-settings
        queryBlock=queryBlock
        open=true
        triggerSelector="#x"
        onBlockReplace=replaceSpy
        onSettingsClose=closeSpy
      }}</div>`);

      await click('.change-to-section .operator-and');
      await waitUntil(
        () => $('.webui-popover').css('display') === 'none', { timeout: 1000 }
      );

      const blockMatcher = sinon.match.instanceOf(AndOperatorQueryBlock)
        .and(sinon.match.has('operands', [condition]));
      expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      expect(closeSpy).to.be.calledOnce;
    }
  );
});
