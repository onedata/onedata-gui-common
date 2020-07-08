/**
 * NOTE: current version adds extra comment tags after lists when converting visual -> md
 * because of bug in: https://github.com/showdownjs/showdown/issues/700 As we are using
 * ember-cli-showdown, the update is currenlty not available
 * 
 * @module components/markdown-editor
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/markdown-editor';
import { computed, observer } from '@ember/object';
import showdown from 'showdown';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional, equal, raw } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { scheduleOnce, next } from '@ember/runloop';
import _ from 'lodash';
import autosize from 'onedata-gui-common/utils/autosize';
import DOMPurify from 'npm:dompurify';

const defaultMode = 'visual';

const htmlToMdTags = {
  strike: 'del',
  b: 'strong',
  i: 'em',
};

const mdToHtmlTags = {
  del: 'strike',
  strong: 'b',
  em: 'i',
};

function convertTags(content, tags) {
  let converted = content;
  for (let sourceTag in tags) {
    const destTag = tags[sourceTag];
    converted = converted.replace(new RegExp(`<(/)?${sourceTag}`, 'g'), `<$1${destTag}`);
  }
  return converted;
}

export default Component.extend(I18n, {
  layout,
  classNames: ['markdown-editor'],

  /**
   * @override
   */
  i18nPrefix: 'components.markdownEditor',

  /**
   * @virtual
   * @type {String}
   */
  mdContent: '',

  /**
   * @virtual
   * @type {Function}
   */
  mdContentChanged: notImplementedThrow,

  /**
   * @virtual
   * @type {Function}
   */
  changeMode: notImplementedThrow,

  /**
   * @type {String}
   */
  htmlContent: '',

  internalMode: defaultMode,

  mode: defaultMode,

  isContentChanged: false,

  modeSwitchIcon: conditional(
    equal('mode', raw('visual')),
    raw('markdown'),
    raw('visual-editor'),
  ),

  modeSwitchText: conditional(
    equal('mode', raw('visual')),
    computedT('markdownEditor'),
    computedT('visualEditor'),
  ),

  displayedMdContent: computed({
    get() {
      return _.escape(this.get('mdContent')).replace(/\n/g, '<br>');
    },
    set(key, value) {
      this.set('mdContent', value.replace(/<br>/g, '\n'));
      return value;
    },
  }),

  converter: computed(function converter() {
    const instance = new showdown.Converter({
      tables: true,
      strikethrough: true,
      literalMidWordUnderscores: true,
      simplifiedAutoLink: true,
      openLinksInNewWindow: true,
      emoji: true,
    });
    return instance;
  }),

  modeChanged: observer('mode', function modeChanged() {
    const {
      internalMode,
      mode,
      element,
    } = this.getProperties('internalMode', 'mode', 'element');
    if (internalMode === 'visual' && mode === 'markdown') {
      scheduleOnce('afterRender', () => {
        this.updateMarkdownContent();
        autosize(element.querySelector('.textarea-source-editor'));
      });
    } else if (mode === 'visual') {
      this.updateVisualContent();
    }
    this.set('internalMode', mode);
  }),

  updateVisualContent() {
    this.changeHtmlContent(this.markdownToHtml(this.get('mdContent')));
  },

  updateMarkdownContent() {
    this.changeMdContent(this.htmlToMarkdown(this.get('htmlContent')));
  },

  markdownToHtml(markdown) {
    return convertTags(this.get('converter').makeHtml(markdown), mdToHtmlTags);
  },

  htmlToMarkdown(html) {
    let sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: htmlAllowedTags,
    }).toString();
    sanitizedHtml = convertTags(sanitizedHtml, htmlToMdTags);
    return this.get('converter').makeMarkdown(sanitizedHtml);
  },

  changeMdContent(content) {
    if (!this.get('isContentChanged')) {
      this.set('isContentChanged', true);
    }
    return this.get('mdContentChanged')(content);
  },

  changeHtmlContent(content) {
    if (!this.get('isContentChanged')) {
      this.set('isContentChanged', true);
    }
    return this.set('htmlContent', content);
  },

  init() {
    this._super(...arguments);
    this.modeChanged();
  },

  actions: {
    isContentChanged(content) {
      this.set('content', content);
    },
    discard() {
      this.get('discard')();
      this.set('isContentChanged', false);
      next(() => {
        if (this.get('mode') === 'visual') {
          this.updateVisualContent();
        }
      });
    },
    save() {
      this.updateMarkdownContent();
      return this.get('save')()
        .then(() => {
          this.set('isContentChanged', false);
        });
    },
    toggleEditorMode() {
      const mode = this.get('mode');
      let newMode = (mode === 'visual') ? 'markdown' : 'visual';
      this.get('changeMode')(newMode);
    },
    changeHtmlContent(content) {
      return this.get('changeHtmlContent')(content);
    },
    changeMdContent(content) {
      return this.get('changeMdContent')(content);
    },
  },
});

const htmlAllowedTags = [
  '#text',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'strike',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ol',
  'ul',
  'li',
  'a',
  'table',
  'tbody',
  'thead',
  'th',
  'tr',
  'td',
  'img',
  'pre',
  'hr',
  'video',
  'blockquote',
  'math',
  'figure',
  'audio',
];
