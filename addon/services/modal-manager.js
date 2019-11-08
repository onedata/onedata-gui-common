import Service from '@ember/service';
import { resolve } from 'rsvp';
import { writable, raw } from 'ember-awesome-macros';

export default Service.extend({
  /**
   * If true, then modal `open` property is true.
   * Should not be changed directly!
   * @type {boolean}
   */
  isModalOpened: false,

  isModalShown: false,

  modalShowResolveCallback: resolve,

  modalHidePromise: writable(raw(resolve())),

  modalHideResolveCallback: resolve,

  queuedShowModalComponentName: null,

  modalComponentName: null,

  modalOptions: Object.freeze({}),

  show(modalComponentName, modalOptions = {}) {
    const {
      queuedShowModalComponentName,
      isModalOpened,
    } = this.getProperties(
      'isModalOpened',
      'queuedShowModalComponentName'
    );

    if (queuedShowModalComponentName) {
      const componentsInfo =
        `First modal component: ${queuedShowModalComponentName}, second modal component: ${modalComponentName}.`;
      throw new Error(
        `modal-manager: You tried to render modal twice in the same runloop frame. ${componentsInfo}`,
      )
    }

    this.set('queuedShowModalComponentName', modalComponentName);

    let shownPromise = resolve();
    if (isModalOpened) {
      // Hide previous modal if it is still opened
      shownPromise = this.hide();
    }

    let hideResolve;
    const hidePromise = new Promise(resolve => {
      hideResolve = resolve;
    }).then(() => {
      this.setProperties({
        modalHideResolveCallback: resolve,
        modalHidePromise: resolve(),
        modalComponentName: null,
        modalOptions: {},
      });
    });

    shownPromise = shownPromise.then(() => {
      return new Promise(showResolve => {
        this.setProperties({
          isModalOpened: true,
          modalComponentName: modalComponentName,
          modalOptions: modalOptions,
          modalHidePromise: hidePromise,
          modalHideResolveCallback: hideResolve,
          modalShowResolveCallback: showResolve,
          queuedShowModalComponentName: null,
        });
      }).then(() => {
        this.set('modalShowResolveCallback', resolve);
      });
    });

    return {
      shownPromise,
      hiddenPromise: hidePromise,
    };
  },

  hide() {
    const {
      isModalOpened,
      isModalShown,
      modalHidePromise,
    } = this.getProperties(
      'isModalOpened',
      'isModalShown',
      'modalHidePromise'
    );

    if (isModalOpened) {
      this.set('isModalOpened', false);

      if (!isModalShown) {
        // Modal has not been shown yet, so we need to simulate whole modal lifecycle
        // to resolve lifecycle promises returned by show() (shownPromise, hiddenPromise).
        this.onModalShown();
        this.onModalHidden();
      }
    }

    return modalHidePromise;
  },

  onModalSubmit(data) {
    const onSubmit = this.get('modalOptions.onSubmit');

    const submitPromise = resolve(onSubmit && onSubmit(data));
    return submitPromise.finally(() => {
      this.hideAfterSubmit();
    });
  },

  onModalFailedSubmit() {
    this.hideAfterSubmit();
    return resolve();
  },

  onModalShown() {
    this.set('isModalShown', true);
    this.get('modalShowResolveCallback')();
  },

  onModalHide() {
    const onHide = this.get('modalOptions.onHide');

    if (onHide && onHide() === false) {
      // Cancel modal hide
      return false;
    } else {
      return this.hide()
    }
  },

  onModalHidden() {
    this.set('isModalShown', false);
    this.get('modalHideResolveCallback')();
  },

  hideAfterSubmit() {
    if (this.get('modalOptions.hideAfterSubmit') !== false) {
      this.hide();
    }
  }
});
