import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | content clusters onepanel redirect', function () {
  setupComponentTest('content-clusters-onepanel-redirect', {
    integration: true,
  });

  it('is shows loading state after redirectToOnepanelApp method was invoked',
    function () {
      const redirectToOnepanelApp = sinon.stub();
      const checkOnepanelAvailability = sinon.stub().resolves(true);
      this.setProperties({
        redirectToOnepanelApp,
        checkOnepanelAvailability,
      });
      this.set('redirectToOnepanelApp', redirectToOnepanelApp);

      this.render(hbs `{{content-clusters-onepanel-redirect
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
