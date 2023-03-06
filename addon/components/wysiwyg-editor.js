/**
 * Reexports Pell editor as custom wysiwyg-editor component with predefined
 * options.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import layout from 'onedata-gui-common/templates/components/wysiwyg-editor';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import pell from 'ember-pell/pell';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['wysiwyg-editor'],
  classNameBindings: ['disabled', 'contentType'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.wysiwygEditor',

  /**
   * One of 'show', 'edit'
   * @virtual
   * @type {string}
   */
  mode: 'show',

  /**
   * @virtual
   * @type {string}
   */
  content: '',

  /**
   * @type {boolean}
   */
  disabled: false,

  /**
   * @virtual
   * @type {Function}
   * @param {string} content
   * @returns {any}
   */
  onChange: notImplementedIgnore,

  contentType: 'wysiwyg',

  /**
   * @type {HTMLSafe}
   */
  htmlSafeContent: computed('content', function htmlSafeContent() {
    return htmlSafe(this.get('content'));
  }),

  /**
   * @type {CopmputedProperty<Object>}
   */
  pellOptions: computed(function pellOptions() {
    return {
      actions: [{
        name: 'bold',
        icon: '<span class="oneicon oneicon-text-bold"></span>',
      }, {
        name: 'italic',
        icon: '<span class="oneicon oneicon-text-italic"></span>',
      }, {
        name: 'underline',
        icon: '<span class="oneicon oneicon-text-underline"></span>',
      }, {
        name: 'strikethrough',
        icon: '<span class="oneicon oneicon-text-strikethrough"></span>',
      }, {
        name: 'removeFormat',
        title: this.t('actions.removeFormat'),
        icon: '<span class="oneicon oneicon-text-clear-formatting"></span>',
        result: () => pell.exec('removeFormat'),
      }, {
        name: 'heading1',
        icon: '<span class="oneicon oneicon-text-heading1"></span>',
      }, {
        name: 'heading2',
        icon: '<span class="oneicon oneicon-text-heading2"></span>',
      }, {
        name: 'heading3',
        icon: '<span class="oneicon oneicon-text-heading3"></span>',
        // pell provides headings up to h2
        result: () => pell.exec('formatBlock', '<h3>'),
      }, {
        name: 'paragraph',
        icon: '<span class="oneicon oneicon-text-paragraph"></span>',
      }, {
        name: 'olist',
        icon: '<span class="oneicon oneicon-text-olist"></span>',
      }, {
        name: 'ulist',
        icon: '<span class="oneicon oneicon-text-ulist"></span>',
      }, {
        name: 'link',
        icon: '<span class="oneicon oneicon-text-link"></span>',
      }],
      defaultParagraphSeparator: 'p',
    };
  }),
});
