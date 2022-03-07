import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import TestComponent from 'onedata-gui-common/components/test-component';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | global modal mounter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('modalManager', lookupService(this, 'modal-manager'));
  });

  it('does not render anything in place', async function () {
    await render(hbs `{{global-modal-mounter}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders component specified by modalManager.show call', async function () {
    this.owner.register('component:modals/some-modal', TestComponent);
    await render(hbs `{{global-modal-mounter}}`);

    this.get('modalManager').show('some-modal');
    await wait();

    expect(this.$('.test-component')).to.exist;
  });

  it('passess modal options and modal id to modal component', async function () {
    const modalOptions = Object.freeze({ a: 1 });
    this.owner.register('component:modals/some-modal', TestComponent);
    await render(hbs `{{global-modal-mounter}}`);

    this.get('modalManager').show('some-modal', modalOptions);
    await wait();

    const testComponent = this.$('.test-component')[0].componentInstance;
    expect(get(testComponent, 'modalOptions')).to.equal(modalOptions);
    expect(get(testComponent, 'modalId'))
      .to.equal(this.get('modalManager.modalInstances.lastObject.id'));
  });
});
