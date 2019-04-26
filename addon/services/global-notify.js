import { get } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import _ from 'lodash';

function aliasToShow(type) {
  return function (message, options) {
    return this.show(type, message, options);
  };
}

/**
 * Exposes methods for reporting various asyc notifications to user.
 *
 * It is used to report:
 * - success in operation
 * - fatal error in operation (esp. for backend operations)
 * - ...and more planned
 *
 * @module services/global-notify
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Service.extend({
  notify: service(),
  alert: service(),
  errorExtractor: service(),

  info: aliasToShow('info'),
  success: aliasToShow('success'),
  warning: aliasToShow('warning'),
  error: aliasToShow('error'),
  warningAlert: aliasToShow('warning-alert'),
  errorAlert: aliasToShow('error-alert'),

  // TODO i18n  
  backendError(message, error) {
    const reason = error && this.get('errorExtractor').getMessage(error);

    let finalMessage =
      `<p><strong>We are sorry, but ${message} failed!</strong></p>`;

    if (reason) {
      finalMessage += '<p><strong>The reason of failure:</strong></p>';
      if (reason.message) {
        finalMessage += `<p>${reason.message}</p>`;
        if (reason.errorJsonString) {
          finalMessage += '<br>';
        }
      }
      if (reason.errorJsonString) {
        finalMessage += `<div class="error-json">${reason.errorJsonString}</div>`;
      }
    } else {
      finalMessage += `<p>Unfortunately, error details are unavailable</p>`;
    }

    this.error(htmlSafe(finalMessage));
  },

  /**
   * Main method for reporting some information to user
   * @param {string} type one of: error, info
   */
  show(type, message, options = {}) {
    const notifyMessage = typeof message === 'object' ? message : { html: message };
    let messageBody = notifyMessage.html;
    let messageIcon = '';
    if (notifyMessage.oneTitle) {
      messageBody =
        `<strong class="title">${notifyMessage.oneTitle}</strong><br><span class="text">${messageBody}</span>`;
    }
    if (notifyMessage.oneIcon) {
      messageIcon =
        `<div class="message-icon"><span class="oneicon one-icon oneicon-${notifyMessage.oneIcon}"></span></div>`;
    }
    notifyMessage.html = `${messageIcon}<div class="message-body">${messageBody}</div>`;
    switch (type) {
      case 'error':
      case 'error-alert':
      case 'warning-alert':
        console.error('global-notify: Error reported: ' + notifyMessage.html);
        if (_.endsWith(type, '-alert')) {
          type = type.substring(0, get(type, 'length') - '-alert'.length)
        }
        return this.get('alert').show(type, notifyMessage, options);
      case 'warning':
      case 'info':
      case 'success':
        return this.get('notify').show(type, notifyMessage, options);
      default:
        break;
    }
  },
});
