/**
 * Generates translated message about lack of privileges.
 *
 * @param {Ember.Service} i18n
 * @param {String} modelName entity that holds privilege, eg. space, group, cluster,
 *  harvester
 * @param {String|Array<String>} privilegeFlag name of privilege in original snake-case
 *  backend form, eg. space_view_transfers; if an array is provided, displays multiple
 *  privileges
 *
 * @module utils/i18n/insufficient-privileges-message
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isMissingMessage } from 'onedata-gui-common/utils/i18n/missing-message';

const i18nPrefix = 'utils.insufficientPrivilegesMessage';

export default function insufficientPrivilegesMessage({
  i18n,
  modelName,
  privilegeFlag,
}) {
  let modelNameTranslated = modelName && i18n.t(`common.modelNames.${modelName}`);
  modelNameTranslated =
    modelNameTranslated && isMissingMessage(modelNameTranslated.string) ?
    undefined : modelNameTranslated;
  const privilegeExpression = createPrivilegeExpression(i18n, modelName, privilegeFlag);
  const i18nKey = `${i18nPrefix}.insufficientPrivileges${modelNameTranslated ? 'WithModel' : ''}`;
  return i18n.t(i18nKey, {
    modelName: modelNameTranslated,
    privilegeExpression,
  });
}

export function createPrivilegeExpression(i18n, modelName, privileges) {
  if (Array.isArray(privileges)) {
    if (privileges.length === 1) {
      return `${singleExpr(i18n, modelName, privileges[0])} ${i18n.t(i18nPrefix + '.privilege')}`;
    } else {
      return privileges.slice(0, -1)
        .map(p => singleExpr(i18n, modelName, p)).join(', ') +
        ` ${i18n.t(i18nPrefix + '.and')} ` +
        singleExpr(i18n, modelName, privileges[privileges.length - 1]) +
        ' ' +
        i18n.t(i18nPrefix + '.privileges');
    }
  } else {
    return `${singleExpr(i18n, modelName, privileges)} ${i18n.t(i18nPrefix + '.privilege')}`;
  }
}

function singleExpr(i18n, modelName, privilegeFlag) {
  return `"${i18n.t(`common.privileges.${modelName}.${privilegeFlag}`)}"`;
}
