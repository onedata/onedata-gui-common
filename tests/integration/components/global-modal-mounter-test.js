import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import TestComponent from 'onedata-gui-common/components/test-component';
import { get } from '@ember/object';

describe('Integration | Component | global-modal-mounter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('modalManager', lookupService(this, 'modal-manager'));
  });

  it('does not render anything in place', async function () {
    await render(hbs `{{global-modal-mounter}}`);

    expect(this.element.children).to.have.length(0);
  });

  it('renders component specified by modalManager.show call', async function () {
    this.owner.register('component:modals/some-modal', TestComponent);
    await render(hbs `{{global-modal-mounter}}`);

    this.get('modalManager').show('some-modal');
    await settled();

    expect(find('.test-component')).to.exist;
  });

  it('passes modal options and modal id to modal component', async function () {
    const modalOptions = Object.freeze({ a: 1 });
    this.owner.register('component:modals/some-modal', TestComponent);
    await render(hbs `{{global-modal-mounter}}`);

    this.get('modalManager').show('some-modal', modalOptions);
    await settled();

    const testComponent = find('.test-component').componentInstance;
    const modalInstance = this.get('modalManager.modalInstances.lastObject');
    expect(get(testComponent, 'modalId')).to.equal(modalInstance.id);
    expect(get(testComponent, 'modalOptions')).to.equal(modalOptions);
    expect(get(testComponent, 'modalApi')).to.equal(modalInstance.api);
  });
});
