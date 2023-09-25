/**
 * General text with link to documentation with customizable documentation path and text
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-doc-see-more';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { oneDocUrl } from 'onedata-gui-common/helpers/one-doc-url';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['one-doc-see-more'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneDocSeeMore',

  /**
   * @virtual optional
   * @type {Boolean}
   * If true, generated text will be suitable as part of sentence.
   * If false, generated tesxt will be suitable as different sentence/paragraph.
   */
  isSentencePart: false,

  /**
   * @virtual optional
   * @type {String}
   * An argument for one-doc-url helper, see `one-doc-url` for details.
   * No used when using block - omit then.
   */
  docPath: '',

  /**
   * @virtual optional
   * @type {String}
   * Text of link displayed for user. Can be empty to display generic link name.
   */
  linkName: '',

  /**
   * @virtual optional
   * @type {ComputedProperty<string>}
   */
  href: computed('docPath', {
    get() {
      return this.injectedHref ?? oneDocUrl([this.docPath]);
    },
    set(key, value) {
      return this.injectedHref = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedHref: null,
});
