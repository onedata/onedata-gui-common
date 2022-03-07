import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | content clusters onepanel redirect', function () {
  setupRenderingTest();

  it('is shows loading state after redirectToOnepanelApp method was invoked',
    async function () {
      const redirectToOnepanelApp = sinon.stub();
      const checkOnepanelAvailability = sinon.stub().resolves(true);
      this.setProperties({
        redirectToOnepanelApp,
        checkOnepanelAvailability,
      });
      this.set('redirectToOnepanelApp', redirectToOnepanelApp);

      await render(hbs `{{content-clusters-onepanel-redirect
        redirectToOnepanelApp=redirectToOnepanelApp
        checkOnepanelAvailability=checkOnepanelAvailability
      }}`);

      return wait().then(() => {
        expect(checkOnepanelAvailability).to.be.calledOnce;
        expect(redirectToOnepanelApp).to.be.calledOnce;
        expect(this.$('.spin-spinner')).to.exist;
      });
    });
});
