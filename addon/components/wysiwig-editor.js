/**
 * Reexports Pell editor as custom wysiwig-editor component with predefined
 * options.
 *
 * @module components/wysiwig-editor
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import layout from 'onedata-gui-common/templates/components/wysiwig-editor';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  classNames: ['wysiwig-editor'],

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
   * @virtual
   * @type {Function}
   * @param {string} content
   * @returns {any}
   */
  onChange: notImplementedIgnore,

  /**
   * @override
   */
  pellOptions: Object.freeze({
    actions: [
      {
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
        name: 'heading1',
        icon: '<span class="oneicon oneicon-text-heading1"></span>',
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
      },
    ],
    defaultParagraphSeparator: 'p',
  }),

  /**
   * @type {HTMLSafe}
   */
  htmlSafeContent: computed('content', function htmlSafeContent() {
    return htmlSafe(this.get('content'));
  }),
});
