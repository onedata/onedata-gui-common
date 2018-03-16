import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers'
import sinon from 'sinon';

describe('Integration | Component | content info', function () {
  setupComponentTest('content-info', {
    integration: true
  });

  it('renders yielded content with buttonAction available for invoking', function () {
    const actionSpy = sinon.stub().resolves();
    this.on('buttonAction', actionSpy);
    this.render(hbs `{{#content-info buttonAction=(action "buttonAction") as |ci|}}
      <button class="btn-action" onclick={{action ci.buttonAction}}>
        click me
      </button>
    {{/content-info}}
    `);
    return click('.btn-action').then(() => {
      expect(actionSpy).to.be.calledOnce;
    });
  });
});
