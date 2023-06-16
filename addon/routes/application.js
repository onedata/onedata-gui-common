/**
 * Common application route procedures in every Onedata web GUI
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import _ from 'lodash';
import smoothscroll from 'smoothscroll-polyfill';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import globals from 'onedata-gui-common/utils/globals';

export default Route.extend(ApplicationRouteMixin, {
  guiUtils: service(),
  navigationState: service(),

  /**
   * Function for ember-cli-document-title
   * @param {Array<string>} tokens
   * @returns {string}
   */
  title(tokens) {
    const {
      guiName,
      guiType,
    } = this.get('guiUtils').getProperties('guiName', 'guiType');
    let resultTokens = tokens.filter(token => !!token);
    if (!resultTokens.length) {
      resultTokens = this.getNavTokens();
    }
    resultTokens = [guiName, ...resultTokens, guiType].filter(token => !!token);
    if (!resultTokens.length) {
      resultTokens.push(this.t('onedata'));
    }
    return resultTokens.join(' – ');
  },

  beforeModel(transition) {
    this._super(...arguments);
    const queryParams = transition.to.queryParams;
    this.set('navigationState.queryParams', queryParams);
    this.smoothScrollPolyfill();
  },

  getNavTokens() {
    const navigationState = this.get('navigationState');
    const {
      activeContentLevel,
      activeResourceType,
      activeResource,
      globalBarAspectTitle,
    } = navigationState.getProperties(
      'activeContentLevel',
      'activeResourceType',
      'activeResource',
      'globalBarAspectTitle'
    );
    switch (activeContentLevel) {
      case 'sidebar':
      case 'contentIndex':
        return [_.upperFirst(activeResourceType)];
      case 'index':
        return [get(activeResource, 'name')];
      case 'aspect':
        return [
          activeResource ? get(activeResource, 'name') : null,
          globalBarAspectTitle,
        ];
      default:
        return [];
    }
  },

  smoothScrollPolyfill() {
    // Both Firefox (any version) and Chrome (from version ~103) don't handle
    // smooth scroll for perfect scrollbar. As Firefox + Chrome cover most of
    // the GUI users, we enforce smooth scroll polyfill in every browser
    // for simplicity.
    globals.window.__forceSmoothScrollPolyfill__ = true;
    smoothscroll.polyfill();
  },

  actions: {
    /**
     * Allows to send transitionTo action from places that not supported it
     * @returns {Promise}
     */
    transitionTo() {
      const transition = this.transitionTo(...arguments);
      return transition.promise;
    },
  },
});
