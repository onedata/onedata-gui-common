/**
 * A loading container for sidebar content showing progress of collection loading.
 *
 * Loading info is provided by SidebarModelLoader.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/template';

/**
 * @typedef {Object} SidebarLoadingContainerSignature
 * @property {Object} Args
 * @property {SidebarModelLoader} Args.sidebarModelLoader
 */

/**
 * @extends {Component<SidebarLoadingContainerSignature>}
 */
export default class SidebarLoadingContainerComponent extends Component {
  loadingContainerSizeClass = 'lg';

  loadingContainerClass = 'sidebar-loading-container';

  @computed()
  get locale() {
    return new Locale('components.sidebarLoadingContainer');
  }

  /** @type {SidebarModelLoader} */
  @reads('args.sidebarModelLoader')
  sidebarModelLoader;

  /** @type {PromiseObject<SidebarCollection>|null} */
  @computed('sidebarModelLoader')
  get sidebarModelProxy() {
    if (!this.sidebarModelLoader) {
      return null;
    }
    return promiseObject(this.sidebarModelLoader.resolveSidebarModel());
  }

  /** @type {OnedataResourceCategory} */
  @reads('sidebarModelLoader.resourceCategory')
  resourceCategory;

  @reads('sidebarModelLoader.progressTracker.totalCount')
  totalCount;

  @computed('sidebarModelLoader.progressTracker.progress')
  get progressPercentage() {
    const progress = this.sidebarModelLoader?.progressTracker?.progress;
    if (typeof progress !== 'number') {
      return undefined;
    }
    return Math.floor(Math.max(0, Math.min(progress * 100, 100)));
  }

  /** @type {SafeString} */
  @computed('resourceCategory')
  get resourceCategoryText() {
    return this.locale.t(
      `resourceCategory.${this.resourceCategory}`, {}, {
        defaultValue: this.locale.t('items'),
      }
    );
  }

  /**
   * @type {boolean}
   */
  @computed('totalCount')
  get isProgressPercentageHidden() {
    return this.totalCount <= 100;
  }

  /**
   * @type {string|undefined}
   */
  @computed('isProgressPercentageHidden', 'progressPercentage')
  get progressPercentageText() {
    const { progressPercentage, isProgressPercentageHidden } = this;
    if (
      !isProgressPercentageHidden &&
      typeof progressPercentage === 'number' &&
      !Number.isNaN(progressPercentage)
    ) {
      return `${progressPercentage}%`;
    } else {
      return undefined;
    }
  }

  @computed(
    'sidebarModelLoader',
    'totalCount',
    'resourceCategoryText',
    'resourceCategory',
    'progressPercentageText',
  )
  get loadingLabel() {
    if (!this.sidebarModelLoader) {
      return undefined;
    }
    const {
      totalCount,
      resourceCategoryText,
      resourceCategory,
      progressPercentageText,
    } = this;
    let upperSafeText;
    if (typeof totalCount !== 'number') {
      upperSafeText = this.locale.t('loadingTextNoTotal', {
        resourceCategoryText,
      });
    } else if (resourceCategory === 'shares') {
      upperSafeText = this.locale.t('loadingTextShares', {
        totalCount,
      });
    } else {
      upperSafeText = this.locale.t('loadingText', {
        totalCount,
        resourceCategoryText,
      });
    }
    if (progressPercentageText) {
      return htmlSafe(`${String(upperSafeText)}<br>${progressPercentageText}`);
    } else {
      return upperSafeText;
    }
  }
}
