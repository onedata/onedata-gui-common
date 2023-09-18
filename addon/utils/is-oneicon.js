/**
 * A util to detect if provided name is known (existing) oneicon name.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// FIXME: remove completely commented icons
export const knownOneicons = new Set([
  'add-filled',
  // 'add',
  'arrow-circle-down',
  'arrow-down',
  'arrow-left',
  // 'arrow-long-up',
  // 'arrow-right-full',
  'arrow-right',
  'arrow-up',
  'atm-inventory',
  'atm-lambda',
  'atm-workflow',
  'axes',
  // 'ban-left-thin',
  'ban-left',
  'browser-archive-add',
  'browser-archive-recall',
  'browser-archive-upload',
  'browser-archive',
  'browser-attribute',
  'browser-copy',
  'browser-cut',
  'browser-dataset-file',
  'browser-dataset',
  'browser-delete',
  'browser-directory',
  // 'browser-distribution',
  'browser-download',
  'browser-file',
  'browser-info',
  'browser-metadata',
  'browser-new-directory',
  'browser-paste',
  'browser-permission',
  'browser-permissions',
  'browser-rename',
  'browser-share',
  'browser-upload',
  'cancelled',
  'cart-checked',
  'cart',
  'certificate',
  'chart',
  // 'checkbox-check',
  // 'checkbox-empty',
  'checkbox-filled-warning',
  'checkbox-filled-x',
  'checkbox-filled',
  // 'checkbox-minus',
  // 'checkbox-option',
  'checkbox-pending',
  'checkbox-x',
  // 'checkbox',
  'checked',
  'circle-copy',
  'circle-id',
  'circle-not-available',
  'circle',
  'clean-filled',
  'clipboard-copy',
  'close',
  'cluster',
  // 'collection-create',
  'collection',
  'columns',
  'consume-token',
  // 'copy',
  'create-time',
  // 'cut',
  'data-receive',
  'data-send',
  // 'file',
  'flatten',
  'folder-new', // FIXME: check, remove?
  'folder-open', // FIXME: check, remove?
  'folder-share', // FIXME: check, remove?
  'folder', // FIXME: check, remove?
  'globe-cursor',
  'globe-filled',
  'globe', // FIXME: check, remove?
  'group-add', // FIXME: check, remove?
  'group-invite', // FIXME: check, remove?
  'group-leave-group', // FIXME: check, remove?
  'group',
  'groups', // FIXME: check, remove?
  'hierarchy',
  'home-outline', // FIXME: check, remove?
  'home', // FIXME: check, remove?
  'inbox', // FIXME: check, remove?
  'index',
  'info-modal',
  'inheritance',
  'invalidate',
  'items-grid',
  'join-plug',
  'join-space', // FIXME: check, remove?
  'join', // FIXME: check, remove?
  'key', // FIXME: check, remove?
  'leave-space', // FIXME: check, remove?
  'light-bulb',
  'link-external',
  'lock-checked', // FIXME: check, remove?
  'lock', // FIXME: check, remove?
  'logout',
  'markdown',
  'membership', // FIXME: check, remove?
  'menu-clusters', // FIXME: check, remove?
  'menu-collection',
  'menu-data', // FIXME: check, remove?
  'menu-groups', // FIXME: check, remove?
  'menu-providers', // FIXME: check, remove?
  'menu-recent', // FIXME: check, remove?
  'menu-shared', // FIXME: check, remove?
  'menu-token', // FIXME: check, remove?
  'menu-transfers', // FIXME: check, remove?
  'menu-trash', // FIXME: check, remove?
  'metadata', // FIXME: check, remove?
  'move-down', // FIXME: check, remove?
  'move-left',
  'move-right',
  'move-up',
  'move',
  'navigate-first',
  'navigate-last',
  'navigate-next',
  'navigate-prev',
  'no-view',
  'node',
  'onepanel',
  'onezone',
  'organization',
  'overview',
  'parents', // FIXME: check, remove?
  'password-change', // FIXME: check, remove?
  'pause',
  'permissions', // FIXME: check, remove?
  'play',
  'plug-in',
  'plug-out',
  'plus',
  'properties',
  'provider-add', // FIXME: check, remove?
  'provider-default', // FIXME: check, remove?
  'provider-home', // FIXME: check, remove?
  'provider', // FIXME: check, remove?
  'providers-outline', // FIXME: check, remove?
  'providers', // FIXME: check, remove?
  'qos',
  'redo',
  'refresh', // FIXME: check, remove?
  'remove', // FIXME: check, remove?
  'rename', // FIXME: check, remove?
  'rerun',
  'rest',
  'role-holders',
  'search',
  'settings-circle-filled', // FIXME: check, remove?
  'settings',
  'share-collection', // FIXME: check, remove?
  'share', // FIXME: check, remove?
  'shortcut',
  'sign-error-rounded',
  'sign-error', // FIXME: check, remove?
  'sign-info-rounded',
  'sign-info', // FIXME: check, remove?
  'sign-question-rounded',
  'sign-question', // FIXME: check, remove?
  'sign-warning-rounded',
  'sign-warning', // FIXME: check, remove?
  'skipped',
  'social-dropbox', // FIXME: check, remove?
  'social-egi', // FIXME: check, remove?
  'social-facebook', // FIXME: check, remove?
  'social-github', // FIXME: check, remove?
  'social-google', // FIXME: check, remove?
  'social-indigo', // FIXME: check, remove?
  'social-plgrid', // FIXME: check, remove?
  'social-rhea', // FIXME: check, remove?
  'space-add',
  'space-default', // FIXME: check, remove?
  'space-empty', // FIXME: check, remove?
  'space-error', // FIXME: check, remove?
  'space-home', // FIXME: check, remove?
  'space-import-provider', // FIXME: check, remove?
  'space-import',
  'space-join', // FIXME: check, remove?
  'space-reload', // FIXME: check, remove?
  'space',
  'square-empty',
  'square-minus-empty', // FIXME: check, remove?
  'square-plus-empty', // FIXME: check, remove?
  'star-empty', // FIXME: check, remove?
  'star', // FIXME: check, remove?
  'support',
  'team', // FIXME: check, remove?
  'text-bold',
  'text-clear-formatting',
  'text-heading1',
  'text-heading2',
  'text-heading3',
  'text-italic',
  'text-link',
  'text-olist',
  'text-paragraph',
  'text-strikethrough',
  'text-ulist',
  'text-underline',
  'time', // FIXME: check, remove?
  'token-access',
  'token-identity',
  'token-invite',
  'tokens',
  'transfers', // FIXME: check, remove?
  'undo',
  'unit',
  'unknown', // FIXME: check, remove?
  'update', // FIXME: check, remove?
  'upload', // FIXME: check, remove?
  'user-add', // FIXME: check, remove?
  'user-profile', // FIXME: check, remove?
  'user',
  'view-grid', // FIXME: check, remove?
  'view-list', // FIXME: check, remove?
  'view',
  'visual-editor',
  'warning', // FIXME: check, remove?
  'x',
  'xml-file', // FIXME: check, remove?
]);

// FIXME: for development
const deprecatedOneicons = new Set([
  'folder-new', // FIXME: check, remove?
  'folder-open', // FIXME: check, remove?
  'folder-share', // FIXME: check, remove?
  'folder', // FIXME: check, remove?
  'globe', // FIXME: check, remove?
  'group-add', // FIXME: check, remove?
  'group-invite', // FIXME: check, remove?
  'group-leave-group', // FIXME: check, remove?
  'groups', // FIXME: check, remove?
  'home-outline', // FIXME: check, remove?
  'home', // FIXME: check, remove?
  'inbox', // FIXME: check, remove?
  'join-space', // FIXME: check, remove?
  'join', // FIXME: check, remove?
  'key', // FIXME: check, remove?
  'leave-space', // FIXME: check, remove?
  'lock-checked', // FIXME: check, remove?
  'lock', // FIXME: check, remove?
  'membership', // FIXME: check, remove?
  'menu-clusters', // FIXME: check, remove?
  'menu-data', // FIXME: check, remove?
  'menu-groups', // FIXME: check, remove?
  'menu-providers', // FIXME: check, remove?
  'menu-recent', // FIXME: check, remove?
  'menu-shared', // FIXME: check, remove?
  'menu-token', // FIXME: check, remove?
  'menu-transfers', // FIXME: check, remove?
  'menu-trash', // FIXME: check, remove?
  'metadata', // FIXME: check, remove?
  'move-down', // FIXME: check, remove?
  'parents', // FIXME: check, remove?
  'password-change', // FIXME: check, remove?
  'permissions', // FIXME: check, remove?
  'provider-add', // FIXME: check, remove?
  'provider-default', // FIXME: check, remove?
  'provider-home', // FIXME: check, remove?
  'provider', // FIXME: check, remove?
  'providers-outline', // FIXME: check, remove?
  'providers', // FIXME: check, remove?
  'refresh', // FIXME: check, remove?
  'remove', // FIXME: check, remove?
  'rename', // FIXME: check, remove?
  'settings-circle-filled', // FIXME: check, remove?
  'share-collection', // FIXME: check, remove?
  'share', // FIXME: check, remove?
  'sign-error', // FIXME: check, remove?
  'sign-info', // FIXME: check, remove?
  'sign-question', // FIXME: check, remove?
  'sign-warning', // FIXME: check, remove?
  'social-dropbox', // FIXME: check, remove?
  'social-egi', // FIXME: check, remove?
  'social-facebook', // FIXME: check, remove?
  'social-github', // FIXME: check, remove?
  'social-google', // FIXME: check, remove?
  'social-indigo', // FIXME: check, remove?
  'social-plgrid', // FIXME: check, remove?
  'social-rhea', // FIXME: check, remove?
  'space-default', // FIXME: check, remove?
  'space-empty', // FIXME: check, remove?
  'space-error', // FIXME: check, remove?
  'space-home', // FIXME: check, remove?
  'space-import-provider', // FIXME: check, remove?
  'space-join', // FIXME: check, remove?
  'space-reload', // FIXME: check, remove?
  'square-minus-empty', // FIXME: check, remove?
  'square-plus-empty', // FIXME: check, remove?
  'star-empty', // FIXME: check, remove?
  'star', // FIXME: check, remove?
  'team', // FIXME: check, remove?
  'time', // FIXME: check, remove?
  'transfers', // FIXME: check, remove?
  'unknown', // FIXME: check, remove?
  'update', // FIXME: check, remove?
  'upload', // FIXME: check, remove?
  'user-add', // FIXME: check, remove?
  'user-profile', // FIXME: check, remove?
  'view-grid', // FIXME: check, remove?
  'view-list', // FIXME: check, remove?
  'warning', // FIXME: check, remove?
  'xml-file', // FIXME: check, remove?
]);

export default function isOneicon(iconName) {
  return knownOneicons.has(iconName);
}

// FIXME: for development
export function isDeprecatedOneicon(iconName) {
  return deprecatedOneicons.has(iconName);
}
