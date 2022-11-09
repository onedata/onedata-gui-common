/**
 * Inline element for showing error (eg. small portion of data cannot be loaded)
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from '../templates/components/error-inline';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['error-inline'],

  /**
   * @override
   */
  i18nPrefix: 'components.errorInline',

  i18n: service(),
  errorExtractor: service(),

  /**
   * @virtual optional
   * @type {Object}
   */
  error: undefined,

  /**
   * Hint shown on hover
   * @virtual optional
   * @type {string}
   */
  tip: computed('error', function tip() {
    if (!this.error) {
      return `${this.t('errorPrefix')}.`;
    }
    const errorMessage = this.errorExtractor.getMessage(this.error)?.message ||
      this.t('unknownError');
    let formattedErrorMessage = _.lowerFirst(String(errorMessage).trim());
    if (!formattedErrorMessage.endsWith('.')) {
      formattedErrorMessage = formattedErrorMessage + '.';
    }
    return `${this.t('errorPrefix')}: ${formattedErrorMessage}`;
  }),
});
