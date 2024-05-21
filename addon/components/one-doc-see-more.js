/**
 * General text with link to documentation with customizable documentation path and text
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-doc-see-more';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { oneDocUrl } from 'onedata-gui-common/helpers/one-doc-url';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['one-doc-see-more'],

  i18n: service(),
  homepageUrl: service(),

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
   * Text of link displayed for user. Can be empty to display generic link name.
   */
  linkName: '',

  /**
   * If provided, the URL will be generated using documentation topic, eg.
   * https://onedata.org/#/home/documentation/topic/21.02/qos
   * @virtual optional
   * @type {string}
   */
  topic: '',

  /**
   * Note: you should not use custom href in typical cases - use topic instead.*If there is not topic
   * for your URL, it should be added to homepage URL handler.
   * @virtual optional
   * @type {String}
   */
  docPath: '',

  /**
   * @virtual optional
   * @type {ComputedProperty<string>}
   */
  href: computed('effDocPath', {
    get() {
      if (this.customHref) {
        return this.customHref;
      }
      if (this.docPath) {
        return oneDocUrl(this, this.docPath);
      }
      if (this.topic) {
        return this.homepageUrl.generateDocumentationUrl({ topic: this.topic });
      }
    },
    set(key, value) {
      return this.customHref = value;
    },
  }),

  /**
   * Stores custom href injected to component.
   * @type {string | null}
   */
  customHref: null,

  generateTopicUrl() {

  },
});
