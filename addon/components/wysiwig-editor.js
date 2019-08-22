/**
 * Reexports Pell editor as custom wysiwig-editor component with predefined
 * options.
 *
 * @module components/wysiwig-editor
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PellEditor from 'ember-pell/components/pell-editor';

export default PellEditor.extend({
  classNames: ['wysiwig-editor'],

  /**
   * @override
   */
  pellOptions: Object.freeze({
    actions: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'heading1',
      // 'heading2',
      'paragraph',
      // 'quote',
      'olist',
      'ulist',
      // 'code',
      // 'line',
      'link',
      // 'image',
    ],
    defaultParagraphSeparator: 'p',
  }),
});
