/**
 * A list entry for single space in context of particular provider
 * in provider-place/drop component.
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import getVisitOneproviderUrl from 'onedata-gui-common/utils/get-visit-oneprovider-url';
import { inject as service } from '@ember/service';

/**
 * @typedef {Object} ProviderPlaceDropSpaceSignature
 * @property {HTMLLIElement} Element
 * @property {ProviderPlaceDropSpaceArgs} Args
 */

/**
 * @typedef {Object} ProviderPlaceDropSpaceArgs
 * @property {Models.Provider} provider
 * @property {Model.Space} space
 * @property {string} providerVersion
 */

/**
 * @type {Component<ProviderPlaceDropSpaceSignature>}
 */
export default class ProviderPlaceDropSpaceComponent extends Component {
  @service guiUtils;
  @service router;

  get space() {
    return this.args.space;
  }

  get provider() {
    return this.args.provider;
  }

  get providerVersion() {
    return this.args.providerVersion;
  }

  get providerId() {
    return this.provider.entityId || this.provider.id;
  }

  get supportSize() {
    if (!this.providerId) {
      return null;
    }
    return this.space.supportSizes?.[this.providerId] ?? null;
  }

  get visitProviderUrl() {
    const { guiUtils, provider, space, router, providerVersion } = this;
    if (providerVersion) {
      return getVisitOneproviderUrl({
        guiUtils,
        router,
        provider,
        providerVersion,
        space,
      });
    } else {
      return undefined;
    }
  }
}
