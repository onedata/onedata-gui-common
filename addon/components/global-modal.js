import Component from '@ember/component';
import layout from '../templates/components/global-modal';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { resolve } from 'rsvp';

export default Component.extend({
  layout,
  tagName: '',

  modalManager: service(),

  onHide: notImplementedIgnore,

  onSubmit: data => data,

  hideAfterSubmit: true,

  actions: {
    submit(data) {
      const {
        onSubmit,
        modalManager,
      } = this.getProperties('onSubmit', 'modalManager');

      return resolve(onSubmit(data))
        .then(data => modalManager.onModalSubmit(data))
        .catch(() => modalManager.onModalFailedSubmit());
    },
    shown() {
      this.get('modalManager').onModalShown();
    },
    hide() {
      const {
        onHide,
        modalManager,
      } = this.getProperties('onHide', 'modalManager');

      if (onHide() === false) {
        return false;
      } else {
        return modalManager.onModalHide();
      }
    },
    hidden() {
      this.get('modalManager').onModalHidden();
    },
  },
});
