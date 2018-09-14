/**
 * Renders single login button. Can optionally have a "link" property set to go
 * to a provided link instead of invoking action.
 * @module components/social-box
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import contrast from 'npm:contrast';
import {
  defaultIconBackgroundColor,
  defaultIconPath,
  darkFgColor,
  lightFgColor,
} from 'onedata-gui-common/utils/auth-box-config';
import layout from '../templates/components/social-box';

export default Component.extend({
  layout,

  tagName: 'div',
  classNames: ['social-box'],

  /**
   * @virtual 
   * Id of authorizer, e.g. google, plgrid, dropbox, google, facebook, ...
   * @type {string}
   */
  authId: undefined,

  /**
   * @virtual
   * @type {string}
   */
  iconBackgroundColor: undefined,

  /**
   * @virtual
   * URL to go when clicked
   * @type {string}
   */
  link: '',

  /**
   * @virtual
   * Text for tooltip
   * @type {string}
   */
  tip: '',

  /**
   * If true, box is used to authenticate - spinner is visible instead of image
   * @type {boolean}
   */
  active: false,

  /**
   * Spinner scale
   * @type {number}
   */
  spinnerScale: 0.25,

  /**
   * Action called on click
   * @type {function}
   * @param {Ember.Component} thisComponent this component instance
   * @return {undefined}
   */
  action: notImplementedIgnore,

  /**
   * Property only for testing purposes.
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  socialIconStyle: computed(
    'authId',
    'iconPath',
    function socialIconStyle() {
      let iconPath = this.get('iconPath');
      iconPath = iconPath || defaultIconPath;
      const style = `background-image: url(${iconPath});`;
      return htmlSafe(style);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  aStyle: computed(
    'iconBackgroundColor',
    function aStyle() {
      let iconBackgroundColor;
      iconBackgroundColor = this.get('iconBackgroundColor') ||
        defaultIconBackgroundColor;
      const fgColor = contrast(iconBackgroundColor) === 'light' ? darkFgColor :
        lightFgColor;
      const style = `background-color: ${iconBackgroundColor}; color: ${fgColor};`;
      return htmlSafe(style);
    }
  ),

  hasLink: computed('link', function hasLink() {
    let link = this.get('link');
    return link && link.length !== 0;
  }),

  actions: {
    clicked() {
      const {
        disabled,
        link,
        _window,
        action,
      } = this.getProperties('disabled', 'link', '_window', 'action');
      this.element.dispatchEvent(new Event('mouseleave'));
      if (!disabled) {
        if (link) {
          _window.location = link;
        } else {
          action(this);
        }
      }
    },
  },
});
