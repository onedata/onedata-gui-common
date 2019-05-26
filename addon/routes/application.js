import Route from '@ember/routing/route';
import $ from 'jquery';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import _ from 'lodash';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

// generated with https://realfavicongenerator.net
const FAVICON_HTML =
  `
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/manifest.json">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ee3f3f">
<meta name="theme-color" content="#363636">
  `;

export default Route.extend(ApplicationRouteMixin, {
  guiUtils: inject(),
  navigationState: inject(),

  /**
   * Function for ember-cli-document-title
   * @param {Array<string>} tokens 
   */
  title(tokens) {
    const {
      guiName,
      guiType,
    } = this.get('guiUtils').getProperties('guiName', 'guiType');
    tokens = tokens.filter(token => !!token);
    if (!tokens.length) {
      tokens = this.getNavTokens();
    }
    tokens = [guiName, ...tokens, guiType].filter(token => !!token);
    if (!tokens.length) {
      tokens.push(this.t('onedata'));
    }
    return tokens.join(' – ');
  },

  beforeModel() {
    this._super(...arguments);
    this.addFavicon();
  },

  addFavicon() {
    $('head').append(FAVICON_HTML);
  },

  getNavTokens() {
    const navigationState = this.get('navigationState');
    const {
      activeContentLevel,
      activeResourceType,
      activeResource,
      globalBarAspectTitle
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
          globalBarAspectTitle
        ];
      default:
        return [];
    }
  },

  actions: {
    /**
     * Allows to send transitionTo action from places that not supported it
     */
    transitionTo() {
      let transition = this.transitionTo(...arguments);
      return transition.promise;
    }
  },
});
