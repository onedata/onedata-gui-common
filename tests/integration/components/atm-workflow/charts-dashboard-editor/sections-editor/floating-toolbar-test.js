import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import sinon from 'sinon';
import {
  createNewSection,
  createNewChart,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/floating-toolbar',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('actionsFactory', {});
    });

    it('has class "floating-toolbar"', async function () {
      await renderComponent();

      expect(find('.floating-toolbar')).to.exist;
    });

    context('when model is section', function () {
      beforeEach(function () {
        this.set('model', createSection(this));
      });

      it('shows "duplicate" and "remove" actions for section model', async function () {
        await renderComponent();

        const actions = findAll('.action');
        expect(actions).to.have.length(2);
        expect(actions[0]).to.have.class('duplicate-action');
        expect(actions[0]).to.contain('.oneicon-browser-copy');
        expect(await new OneTooltipHelper(actions[0]).getText())
          .to.equal('Duplicate');
        expect(actions[1]).to.have.class('remove-action');
        expect(actions[1]).to.contain('.oneicon-browser-delete');
        expect(await new OneTooltipHelper(actions[1]).getText())
          .to.equal('Remove');
      });

      itTriggersDuplicateAction();
      itTriggersRemoveAction();
    });

    context('when model is chart', function () {
      beforeEach(function () {
        this.set('model', createChart(this));
      });

      it('shows "duplicate" and "remove" actions for section model', async function () {
        await renderComponent();

        const actions = findAll('.action');
        expect(actions).to.have.length(2);
        expect(actions[0]).to.have.class('duplicate-action');
        expect(actions[0]).to.contain('.oneicon-browser-copy');
        expect(await new OneTooltipHelper(actions[0]).getText())
          .to.equal('Duplicate');
        expect(actions[1]).to.have.class('remove-action');
        expect(actions[1]).to.contain('.oneicon-browser-delete');
        expect(await new OneTooltipHelper(actions[1]).getText())
          .to.equal('Remove');
      });

      itTriggersDuplicateAction();
      itTriggersRemoveAction();
    });
  }
);

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/floating-toolbar
    model=model
    actionsFactory=actionsFactory
  }}`);
}

function createSection(testCase, props = {}) {
  const section = createNewSection(testCase.owner.lookup('service:i18n'));
  setProperties(section, props);
  return section;
}

function createChart(testCase, props = {}) {
  const chart = createNewChart(testCase.owner.lookup('service:i18n'));
  setProperties(chart, props);
  return chart;
}

function itTriggersDuplicateAction() {
  it('triggers duplication on "duplicate" click', async function () {
    const executeSpy = sinon.spy();
    this.actionsFactory.createDuplicateElementAction = sinon.spy(() => ({
      execute: executeSpy,
    }));
    await renderComponent();
    expect(this.actionsFactory.createDuplicateElementAction).to.be.not.called;

    await click('.duplicate-action');

    expect(this.actionsFactory.createDuplicateElementAction).to.be.calledOnce
      .and.calledWith({ elementToDuplicate: this.model });
    expect(executeSpy).to.be.calledOnce;
  });
}

function itTriggersRemoveAction() {
  it('triggers removal on "remove" click', async function () {
    const executeSpy = sinon.spy();
    this.actionsFactory.createRemoveElementAction = sinon.spy(() => ({
      execute: executeSpy,
    }));
    await renderComponent();
    expect(this.actionsFactory.createRemoveElementAction).to.be.not.called;

    await click('.remove-action');

    expect(this.actionsFactory.createRemoveElementAction).to.be.calledOnce
      .and.calledWith({ elementToRemove: this.model });
    expect(executeSpy).to.be.calledOnce;
  });
}
