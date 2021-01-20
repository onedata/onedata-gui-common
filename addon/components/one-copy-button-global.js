/**
 * Global component for copying to clipboard.
 *
 * @module components/one-copy-button-global
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../templates/components/one-copy-button-global';
import CopyButton from 'ember-cli-clipboard/components/copy-button';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import { or } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';

export default CopyButton.extend(I18n, {
  layout,

  globalClipboard: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * Use translation from one-copy-button component
   */
  i18nPrefix: 'components.oneCopyButton',

  /**
   * @override
   */
  class: 'btn-global-copy-button',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clipboardText: reads('globalClipboard.textToCopy'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  textType: or('globalClipboard.textType', computedT('defaultTextType')),

  actions: {
    clipboardSuccess() {
      const {
        globalNotify,
        textType,
      } = this.getProperties('globalNotify', 'textType');
      globalNotify.success(this.t(
        'copySuccess', {
          textType: _.startCase(textType),
        }
      ));
    },
    clipboardError() {
      const {
        globalNotify,
        textType,
      } = this.getProperties('globalNotify', 'textType');
      globalNotify.error(this.t(
        'copyFailure', {
          textType: textType,
        }
      ));
    },
  },
});
