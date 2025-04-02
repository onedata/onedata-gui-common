// FIXME: jsdoc

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
 * @type {Component<SidebarLoadingContainerSignature>}
 */
export default class SidebarLoadingContainerComponent extends Component {
  loadingContainerSizeClass = 'lg';

  loadingContainerClass = 'sidebar-loading-container';

  constructor() {
    super(...arguments);
    // FIXME: debug code
    ((name) => {
      window[name] = this;
      console.log(`window.${name}`, window[name]);
    })('debug_sidebar_loading_container');
  }

  @computed()
  get locale() {
    return new Locale('components.sidebarLoadingContainer');
  }

  /** @type {SidebarModelLoader} */
  @reads('args.sidebarModelLoader') sidebarModelLoader;

  /** @type {PromiseObject<SidebarCollection>|null} */
  @computed('sidebarModelLoader')
  get sidebarModelProxy() {
    if (!this.sidebarModelLoader) {
      return null;
    }
    return promiseObject(this.sidebarModelLoader.resolveSidebarModel());
  }

  /** @type {OnedataResourceCategory} */
  @reads('sidebarModelLoader.resourceCategory') resourceCategory;

  @reads('sidebarModelLoader.totalCount') totalCount;

  @computed('sidebarModelLoader.batchProgress.progress')
  get progressPercentage() {
    const progress = this.sidebarModelLoader?.batchProgress?.progress;
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

  @computed(
    'sidebarModelLoader',
    'totalCount',
    'resourceCategoryText',
    'resourceCategory',
    'progressPercentage',
  )
  get loadingLabel() {
    if (!this.sidebarModelLoader) {
      return undefined;
    }
    const {
      totalCount,
      resourceCategoryText,
      resourceCategory,
      progressPercentage,
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
    if (typeof progressPercentage === 'number' && !Number.isNaN(progressPercentage)) {
      return htmlSafe(`${String(upperSafeText)}<br>${progressPercentage}%`);
    } else {
      return upperSafeText;
    }
  }
}
