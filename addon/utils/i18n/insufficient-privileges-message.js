/**
 * Generates translated message about lack of privileges.
 * 
 * @param {Ember.Service} i18n
 * @param {String} [modelName] entity that holds privilege, eg. space, group, cluster,
 *  harvester
 * @param {String} privilegeFlag name of privilege in original snake-case backend form,
 *  eg. space_view_transfers
 * 
 * @module utils/i18n/insufficient-privileges-message
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isMissingMessage } from 'onedata-gui-common/utils/i18n/missing-message';

export default function insufficientPrivilegesMessage({
  i18n,
  modelName,
  privilegeFlag,
}) {
  let modelNameTranslated = modelName && i18n.t(`common.modelNames.${modelName}`);
  modelNameTranslated =
    modelNameTranslated && isMissingMessage(modelNameTranslated.string) ?
    undefined : modelNameTranslated;
  const privilegePrefix = privilegeFlag.split('_')[0];
  const privilegeTranslated = i18n.t(`common.privileges.${privilegePrefix}.${privilegeFlag}`);
  const i18nKey = `utils.insufficientPrivilegesMessage.insufficientPrivileges${modelNameTranslated ? 'WithModel' : ''}`;
  return i18n.t(i18nKey, {
    modelName: modelNameTranslated,
    privilege: privilegeTranslated,
  });
}
