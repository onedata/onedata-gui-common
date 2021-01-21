/**
 * NOTE: current version adds extra comment tags after lists when converting visual -> md
 * because of bug in: https://github.com/showdownjs/showdown/issues/700
 * As we are using ember-cli-showdown, the update is currently not available.
 * 
 * @module components/markdown-editor
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/markdown-editor';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional, equal, raw, and, isEmpty } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import autosize from 'onedata-gui-common/utils/autosize';
import { scheduleOnce } from '@ember/runloop';
import { observer } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const defaultMode = 'markdown';

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

  mode: defaultMode,

  isContentChanged: false,

  modeSwitchIcon: conditional(
    equal('mode', raw('visual')),
    raw('markdown'),
    raw('view'),
  ),

  modeSwitchText: conditional(
    equal('mode', raw('visual')),
    computedT('editMarkdown'),
    computedT('openPreview'),
  ),

  modeCurrentIcon: conditional(
    equal('mode', raw('visual')),
    raw('view'),
    raw('markdown'),
  ),

  modeCurrentText: conditional(
    equal('mode', raw('visual')),
    computedT('preview'),
    computedT('markdownEditor'),
  ),

  autoApplyAutosize: observer(
    'mode',
    function autoApplyAutosize() {
      if (this.get('mode') === 'markdown') {
        scheduleOnce('afterRender', () => {
          const textarea = this.get('element').querySelector('.textarea-source-editor');
          if (textarea) {
            autosize(textarea);
          }
        });
      }
    }
  ),

  changeHtmlContent(content) {
    if (!this.get('isContentChanged')) {
      this.set('isContentChanged', true);
    }
    return this.set('htmlContent', content);
  },

  isToggleEditorDisabled: and(equal('mode', raw('markdown')), isEmpty('mdContent')),

  init() {
    this._super(...arguments);
    this.autoApplyAutosize();
  },

  actions: {
    isContentChanged(content) {
      this.set('content', content);
    },
    discard() {
      this.get('discard')();
      this.set('isContentChanged', false);
    },
    save() {
      return this.get('save')().then(() => {
        safeExec(this, 'set', 'isContentChanged', false);
      });
    },
    mdContentChanged(content) {
      if (!this.get('isContentChanged')) {
        this.set('isContentChanged', true);
      }
      this.get('mdContentChanged')(content);
    },
    toggleEditorMode() {
      const mode = this.get('mode');
      let newMode = (mode === 'visual') ? 'markdown' : 'visual';
      this.get('changeMode')(newMode);
    },
  },
});
