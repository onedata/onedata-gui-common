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

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['error-inline'],

  /**
   * @override
   */
  i18nPrefix: 'components.errorInline',

  i18n: service(),

  /**
   * Hint shown on hover
   * @virtual optional
   * @type {string}
   */
  tip: computed('i18n', function tip() {
    return this.t('defaultTip');
  }),
});
