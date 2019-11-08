import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Component | global modal mounter', function () {
  setupComponentTest('global-modal-mounter', {
    integration: true
  });

  beforeEach(function () {
    this.set('modalManager', lookupService(this, 'modal-manager'));
  });

  it('does not render anything in place', function () {
    this.render(hbs `{{global-modal-mounter}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders component specified by modalManager.componentName', function () {
    this.set('modalManager.componentName', 'remove-modal');

    this.render(hbs `{{global-modal-mounter testMode=true}}`);

    expect(this.$('.rendered-component').text()).to.equal('modals/remove-modal');
  });
});
