import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | one sidebar toolbar', function () {
  setupComponentTest('one-sidebar-toolbar', {
    integration: true,
  });

  it('renders button', function () {
    this.set('buttons', [{
      icon: 'space',
    }]);
    this.render(hbs `{{one-sidebar-toolbar buttons=buttons}}
    <div class="collapsible-toolbar-global-toggle"></div>`);
    expect(this.$('.oneicon-space')).to.have.length(1);
  });

  it('renders button that calls given action', function (done) {
    const actionSpy = sinon.spy();
    this.set('buttons', [{
      icon: 'space',
      action: actionSpy,
      class: 'test-button',
    }]);
    this.render(hbs `
      {{one-sidebar-toolbar buttons=buttons}}
      <div class="collapsible-toolbar-global-toggle"></div>
    `);
    click('.test-button').then(() => {
      expect(actionSpy).to.be.calledOnce;
      done();
    });
  });
});
