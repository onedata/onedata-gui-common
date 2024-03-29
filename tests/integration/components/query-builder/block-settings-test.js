import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import sinon from 'sinon';
import { get } from '@ember/object';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | query-builder/block-settings', function () {
  setupRenderingTest();

  it('does not show block selector when "open" is false', async function () {
    this.set('queryBlock', NotOperatorQueryBlock.create());

    await render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=false
      triggerSelector="#x"
    }}</div>`);

    expect(globals.document.querySelector('.webui-popover')).to.not.exist;
  });

  it('shows block selector when "open" is true', async function () {
    this.set('queryBlock', NotOperatorQueryBlock.create());

    await render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=true
      triggerSelector="#x"
    }}</div>`);

    expect(globals.document.querySelector('.webui-popover'))
      .to.exist.and.have.class('in');

    const blockSelector = globals.document.querySelector('.query-builder-block-selector');
    expect(blockSelector).to.exist;
    expect(blockSelector).to.have.class('edit-block-selector');
  });

  it('shows block selector (operator block variant)', async function () {
    this.set('queryBlock', NotOperatorQueryBlock.create());

    await render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=true
      triggerSelector="#x"
    }}</div>`);

    const blockSelector = globals.document.querySelector('.query-builder-block-selector');
    expect(globals.document.querySelector('.webui-popover')).to.exist.and.have.class('in');
    expect(blockSelector).to.exist;
    // only operator blocks have "change to" section
    expect(blockSelector.querySelector('.change-to-section')).to.exist;
  });

  it('shows block selector (condition block variant)', async function () {
    this.set('queryBlock', ConditionQueryBlock.create());

    await render(hbs `<div id="x">{{query-builder/block-settings
      queryBlock=queryBlock
      open=true
      triggerSelector="#x"
    }}</div>`);

    const blockSelector = globals.document.querySelector('.query-builder-block-selector');
    expect(globals.document.querySelector('.webui-popover'))
      .to.exist.and.have.class('in');
    expect(blockSelector).to.exist;
    // condition blocks don't have "change to" section
    expect(globals.document.querySelector('.change-to-section')).to.not.exist;
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

      await render(hbs `<div id="x">{{query-builder/block-settings
        queryBlock=queryBlock
        open=true
        triggerSelector="#x"
        onBlockReplace=replaceSpy
        onSettingsClose=closeSpy
      }}</div>`);

      await click('.surround-section .operator-and');
      await waitUntil(() =>
        !globals.document.querySelector('.webui-popover').matches('.in')
      );

      expect(replaceSpy).to.be.calledOnce;
      const blocks = replaceSpy.firstCall.args[0];
      expect(get(blocks, 'length')).to.equal(1);
      const block = blocks[0];
      expect(get(block, 'operands')).to.deep.equal([queryBlock]);
      expect(get(block, 'operator')).to.equal('and');
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
      const condition = ConditionQueryBlock.create();
      queryBlock.addOperand(condition);

      await render(hbs `<div id="x">{{query-builder/block-settings
        queryBlock=queryBlock
        open=true
        triggerSelector="#x"
        onBlockReplace=replaceSpy
        onSettingsClose=closeSpy
      }}</div>`);

      await click('.change-to-section .operator-and');
      await waitUntil(() =>
        !globals.document.querySelector('.webui-popover').matches('.in')
      );

      expect(replaceSpy).to.be.calledOnce;
      const blocks = replaceSpy.firstCall.args[0];
      expect(get(blocks, 'length')).to.equal(1);
      const block = blocks[0];
      expect(get(block, 'operands')).to.deep.equal([condition]);
      expect(get(block, 'operator')).to.equal('and');
      expect(closeSpy).to.be.calledOnce;
    }
  );
});
