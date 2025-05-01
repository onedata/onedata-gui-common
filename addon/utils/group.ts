/**
 * Contains types and util functions related to groups.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { t } from 'onedata-gui-common/utils/i18n/t';
import { SafeString } from 'onedata-gui-common/utils/missing-types';

const i18nPrefix = 'utils.group';

// Group attributes specification

export enum GroupAttribute {
  GroupId = 'groupId',
  Name = 'name',
  Type = 'type',
}

export const groupAttributesArray: ReadonlyArray<GroupAttribute> =
  Object.values(GroupAttribute).sort();

export function translateGroupAttribute(
  groupAttribute: GroupAttribute
): SafeString | null {
  return t(`${i18nPrefix}.attributes.${groupAttribute}`);
}

// Group types specification

export enum GroupType {
  /**
   * Represents an organization; institution or virtual organization (VO), e.g.
   * "Elixir Europe".
   */
  Organization = 'organization',

  /**
   * Represents a unit in organization, e.g. "R&D department".
   */
  Unit = 'unit',

  /**
   * Represents a collaborating team of users that address a specific
   * issue / topic, e.g. "WP5.1".
   */
  Team = 'team',

  /**
   * Groups people that posses a certain role, e.g. "Admins" (in Onedata,
   * there is no concept of roles - rather than that, users with the same
   * role/privileges should be organized in groups).
   */
  RoleHolders = 'role_holders',
}

export const groupTypesArray: ReadonlyArray<GroupType> = Object.values(GroupType).sort();

export function translateGroupType(groupType: GroupType): SafeString | null {
  return t(`${i18nPrefix}.types.${groupType}`);
}
