/* global showdown */

import Component from '@ember/component';
import layout from '../templates/components/markdown-editor';
import { computed, observer } from '@ember/object';

export default Component.extend({
  layout,
  classNames: ['markdown-editor'],

  // htmlContent: '<table><tr><td style="background-color: red;">hello world</td><td>Dwa</td></tr></table>',

  htmlContent: '',

  mdContent: '',

  _mode: 'html',

  mode: 'html',

  converter: computed(function converter() {
    const instance = new showdown.Converter({
      tables: true,
      openLinksInNewWindow: true,
      emoji: true,
      simplifiedAutoLink: true,
    });
    instance.setFlavor('github');
    return instance;
  }),

  modeChanged: observer('mode', function modeChanged() {
    const {
      _mode,
      mode,
      converter,
      htmlContent,
      mdContent,
    } = this.getProperties('_mode', 'mode', 'converter', 'htmlContent', 'mdContent');
    if ((_mode === 'html' || _mode === 'preview') && mode === 'source') {
      this.set('mdContent', converter.makeMarkdown(htmlContent));
    } else if (_mode === 'source' && (mode === 'html' || mode === 'preview')) {
      this.set('htmlContent', converter.makeHtml(mdContent));
    }
    this.set('_mode', mode);
  }),

  init() {
    this._super(...arguments);
    this.modeChanged();
  },

  actions: {
    contentChanged(content) {
      this.set('content', content);
    },
  },
});
