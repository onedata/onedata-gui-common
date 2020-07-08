import Component from '@ember/component';
import layout from '../templates/components/markdown-editor';
import { computed, observer } from '@ember/object';
import showdown from 'showdown';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional, equal, raw } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { scheduleOnce } from '@ember/runloop';
import _ from 'lodash';
import autosize from 'autosize';

const defaultMode = 'visual';

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

  // FIXME: experimental
  // internalMode: reads('mode'),

  internalMode: defaultMode,

  mode: defaultMode,

  modeSwitchIcon: conditional(
    equal('mode', raw('visual')),
    raw('view-list'),
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
    instance.setFlavor('github');
    return instance;
  }),

  modeChanged: observer('mode', function modeChanged() {
    const {
      internalMode,
      mode,
      converter,
      htmlContent,
      mdContent,
    } = this.getProperties('internalMode', 'mode', 'converter', 'htmlContent', 'mdContent');
    if (internalMode === 'visual' && mode === 'markdown') {
      scheduleOnce('afterRender', () => {
        this.changeMdContent(converter.makeMarkdown(htmlContent));
        autosize(this.get('element').querySelector('.textarea-source-editor'));
      });
    } else if (mode === 'visual') {
      this.changeHtmlContent(converter.makeHtml(mdContent));
    }
    this.set('internalMode', mode);
  }),

  changeMdContent(content) {
    return this.get('mdContentChanged')(content);
  },

  changeHtmlContent(content) {
    return this.set('htmlContent', content);
  },

  init() {
    this._super(...arguments);
    this.modeChanged();
  },

  actions: {
    contentChanged(content) {
      this.set('content', content);
    },
    discard() {
      this.get('discard')();
    },
    save() {
      this.get('save')();
    },
    toggleEditorMode() {
      const mode = this.get('mode');
      let newMode = (mode === 'visual') ? 'markdown' : 'visual';
      this.get('changeMode')(newMode);
    },
  },
});
