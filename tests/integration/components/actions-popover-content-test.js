import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | actions popover content', function () {
  setupComponentTest('actions-popover-content', {
    integration: true,
  });

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

  it('renders actions', function (done) {
    const actions = this.get('acts');
    const action = actions[0];
    action.action = sinon.spy();
    this.render(hbs `{{actions-popover-content actionsArray=acts}}`);

    const actionItem = this.$('li:first-child');
    expect(actionItem).to.exist;
    expect(actionItem.find('a')).to.have.class(action.class);
    expect(actionItem.find(`.oneicon-${action.icon}`)).to.exist;
    expect(actionItem.find('.one-label').text().trim()).to.equal(action.title);
    click(actionItem.find('a')[0]).then(() => {
      expect(action.action).to.be.calledOnce;
      done();
    });
  });

  it('renders header', function () {
    const actions = this.get('acts');
    const header = actions[1];
    this.render(hbs `{{actions-popover-content actionsArray=acts}}`);

    const actionItem = this.$('li:last-child');
    expect(actionItem).to.exist;
    expect(actionItem).to.have.class('separator');
    expect(actionItem.find('.one-label').text().trim()).to.equal(header.title);
  });

  it('calls actionClicked after action click', function (done) {
    const clickSpy = sinon.spy();
    this.on('actionClicked', clickSpy);
    this.render(hbs `{{actions-popover-content
      actionsArray=acts
      actionClicked=(action "actionClicked")}}
    `);

    click('.actions-popover-content li:first-child a').then(() => {
      expect(clickSpy).to.be.calledOnce;
      done();
    });
  });
});
