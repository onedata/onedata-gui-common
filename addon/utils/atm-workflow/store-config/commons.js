/**
 * Contains functionality reused between different store types.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const commonDataSpecFilters = [{
  filterType: 'forbiddenType',
  forbiddenTypes: [{
    type: 'onedatafsCredentials',
  }],
}];
