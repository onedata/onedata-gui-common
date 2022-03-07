import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | one sidebar toolbar', function () {
  setupRenderingTest();

  it('renders button', async function () {
    this.set('buttons', [{
      icon: 'space',
    }]);
    await render(hbs `{{one-sidebar-toolbar buttons=buttons}}
    <div class="collapsible-toolbar-global-toggle"></div>`);
    expect(this.$('.oneicon-space')).to.have.length(1);
  });

  it('renders button that calls given action', async function (done) {
    const actionSpy = sinon.spy();
    this.set('buttons', [{
      icon: 'space',
      action: actionSpy,
      class: 'test-button',
    }]);
    await render(hbs `
      {{one-sidebar-toolbar buttons=buttons}}
      <div class="collapsible-toolbar-global-toggle"></div>
    `);
    click('.test-button').then(() => {
      expect(actionSpy).to.be.calledOnce;
      done();
    });
  });
});
