import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import TestComponent from 'onedata-gui-common/components/test-component';
import { get, setProperties } from '@ember/object';

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

  it('renders component specified by modalManager.modalComponentName', function () {
    this.set('modalManager.modalComponentName', 'some-modal');
    this.register('component:modals/some-modal', TestComponent);

    this.render(hbs `{{global-modal-mounter}}`);

    expect(this.$('.test-component')).to.exist;
  });

  it('passess modalManager.modalOptions to modal component', function () {
    const modalOptions = Object.freeze({ a: 1 });
    setProperties(this.get('modalManager'), {
      modalComponentName: 'some-modal',
      modalOptions,
    });
    this.register('component:modals/some-modal', TestComponent);

    this.render(hbs `{{global-modal-mounter}}`);

    const testComponent = this.$('.test-component')[0].componentInstance;
    expect(get(testComponent, 'modalOptions')).to.equal(modalOptions);
  });
});
