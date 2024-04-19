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
  Organization = 'organization',
  Unit = 'unit',
  Team = 'team',
  RoleHolders = 'role_holders',
}

export const groupTypesArray: ReadonlyArray<GroupType> =
  Object.values(GroupType).sort();

export function translateGroupType(
  groupType: GroupType
): SafeString | null {
  return t(`${i18nPrefix}.types.${groupType}`);
}
