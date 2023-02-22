import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | actions popover content', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('acts', [{
      action: () => {},
      title: 'action1',
      icon: 'space',
      class: 'someClass',
    }, {
      title: 'header',
      separator: true,
    }]);
  });

  it('renders actions', async function () {
    const actions = this.get('acts');
    const action = actions[0];
    action.action = sinon.spy();
    await render(hbs `{{actions-popover-content actionsArray=acts}}`);

    const actionItem = find('li:first-child');
    expect(actionItem).to.exist;
    expect(actionItem.querySelector('a')).to.have.class(action.class);
    expect(actionItem.querySelector(`.oneicon-${action.icon}`)).to.exist;
    expect(actionItem.querySelector('.one-label').textContent.trim())
      .to.equal(action.title);
    await click(actionItem.querySelector('a'));
    expect(action.action).to.be.calledOnce;
  });

  it('renders header', async function () {
    const actions = this.get('acts');
    const header = actions[1];
    await render(hbs `{{actions-popover-content actionsArray=acts}}`);

    const actionItem = find('li:last-child');
    expect(actionItem).to.exist;
    expect(actionItem).to.have.class('separator');
    expect(actionItem.querySelector('.one-label').textContent.trim())
      .to.equal(header.title);
  });

  it('calls actionClicked after action click', async function () {
    const clickSpy = sinon.spy();
    this.set('actionClicked', clickSpy);
    await render(hbs `{{actions-popover-content
      actionsArray=acts
      actionClicked=(action actionClicked)}}
    `);

    await click('.actions-popover-content li:first-child a');
    expect(clickSpy).to.be.calledOnce;
  });
});
