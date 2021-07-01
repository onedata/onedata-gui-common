import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import TestComponent from 'onedata-gui-common/components/test-component';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | global modal mounter', function () {
  setupComponentTest('global-modal-mounter', {
    integration: true,
  });

  beforeEach(function () {
    this.set('modalManager', lookupService(this, 'modal-manager'));
  });

  it('does not render anything in place', function () {
    this.render(hbs `{{global-modal-mounter}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders component specified by modalManager.show call', async function () {
    this.register('component:modals/some-modal', TestComponent);
    this.render(hbs `{{global-modal-mounter}}`);

    this.get('modalManager').show('some-modal');
    await wait();

    expect(this.$('.test-component')).to.exist;
  });

  it('passess modal options and modal id to modal component', async function () {
    const modalOptions = Object.freeze({ a: 1 });
    this.register('component:modals/some-modal', TestComponent);
    this.render(hbs `{{global-modal-mounter}}`);

    this.get('modalManager').show('some-modal', modalOptions);
    await wait();

    const testComponent = this.$('.test-component')[0].componentInstance;
    expect(get(testComponent, 'modalOptions')).to.equal(modalOptions);
    expect(get(testComponent, 'modalId'))
      .to.equal(this.get('modalManager.modalInstances.lastObject.id'));
  });
});
