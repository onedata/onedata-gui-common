import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | content info', function () {
  setupRenderingTest();

  it('renders yielded content with buttonAction available for invoking', async function () {
    const actionSpy = sinon.stub().resolves();
    this.set('buttonAction', actionSpy);
    await render(hbs `{{#content-info buttonAction=(action buttonAction) as |ci|}}
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
