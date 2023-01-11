import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | one sidebar toolbar', function () {
  setupRenderingTest();

  it('renders button', async function () {
    this.set('buttons', [{
      icon: 'space',
    }]);
    await render(hbs `{{one-sidebar-toolbar buttons=buttons}}
    <div class="collapsible-toolbar-global-toggle"></div>`);
    expect(findAll('.oneicon-space')).to.have.length(1);
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
