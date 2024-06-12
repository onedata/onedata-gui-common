/**
 * Checks if there is a potential problematic browser extension that can aggressively remove
 * elements from the app. There are e.g. social buttons blockers that remove elements with
 * "share" strings in class names. If that kind of extension is detected - show a warning
 * modal.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import globals from 'onedata-gui-common/utils/globals';
import isVisible from 'onedata-gui-common/utils/dom/is-visible';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import sleep from 'onedata-gui-common/utils/sleep';

const testedClasses = [
  'item-shares',
  'social-box',
  'share-head',
];

const testingElementClass = 'blocking-addon-detector';

const suppressDetectionFlag = 'suppressElementsBlockingAddonWarning';

const mixins = [
  I18n,
  OwnerInjector,
];

export default class BlockingAddonDetector extends EmberObject.extend(...mixins) {
  @service modalManager;
  @service router;
  @service i18n;

  i18nPrefix = 'utils.blockingAddonDetector';

  /** @type {HTMLDivElement} */
  element = undefined;

  get testerClasses() {
    return [testingElementClass, ...testedClasses].join(' ');
  }

  /**
   * Inserts testing element and checks if it is not hidden by browser - if so, it
   * displays the warning modal.
   * @returns {void}
   */
  async runCheck() {
    if (this.getPersistedSuppressDetectionFlag()) {
      return;
    }
    try {
      this.insertTestElement();
      // some extensions, like uBlock Origin, need some time to do their work
      await sleep(500);
      if (!this.isTesterVisible()) {
        this.showWarningModal();
      }
    } finally {
      this.removeTestElement();
    }
  }

  insertTestElement() {
    /** @type {HTMLDivElement} */
    const element = globals.document.createElement('div');
    element.classList.add(testingElementClass, ...testedClasses);
    globals.document.body.appendChild(element);
    this.set('element', element);
  }

  removeTestElement() {
    this.element?.remove();
  }

  /**
   * @returns {boolean}
   */
  isTesterVisible() {
    if (!this.element) {
      return false;
    }
    if (!this.element || !globals.document.body.contains(this.element)) {
      return false;
    }
    return isVisible(this.element);
  }

  async showWarningModal() {
    await this.modalManager.show('question-modal', {
      headerIcon: 'sign-warning-rounded',
      headerText: this.t('warning'),
      descriptionParagraphs: [{
        text: this.t('detectedText'),
      }, {
        text: this.t('issues'),
      }, {
        text: this.t('noAdvertisementsText'),
      }],
      yesButtonText: this.t('dismiss'),
      yesButtonType: 'default',
      checkboxMessage: this.t('doNotDisplay'),
      isNoButtonHidden: true,
      isCheckboxBlocking: false,
      shouldCloseOnTransition: false,
      modalClassName: 'blocking-addon-warning-modal',
      onSubmit: async ({ isCheckboxChecked }) => {
        if (isCheckboxChecked) {
          this.setPersistedSuppressDetectionFlag();
        }
      },
    }).hiddenPromise;
  }

  getPersistedSuppressDetectionFlag() {
    return Boolean(globals.localStorage.getItem(suppressDetectionFlag));
  }

  setPersistedSuppressDetectionFlag() {
    return globals.localStorage.setItem(suppressDetectionFlag, 'true');
  }
}
