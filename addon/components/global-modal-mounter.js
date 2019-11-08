import Component from '@ember/component';
import layout from '../templates/components/global-modal-mounter';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: '',

  modalManager: service(),

  testMode: false,

  componentName: computed('modalManager.componentName', function componentName() {
    const componentNameFromManager = this.get('modalManager.componentName');
    return componentNameFromManager ? `modals/${componentNameFromManager}` : null;
  }),
});
