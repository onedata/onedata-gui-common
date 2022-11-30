import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { or, raw } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/main-content';
import { inject as service } from '@ember/service';

/**
 * @typedef {Object} MainContentViewOptions
 * @property {string} className Additional classname added to main-content component.
 */

export default Component.extend({
  layout,
  classNames: ['main-content'],
  classNameBindings: ['mainContentViewOptions.className'],

  /**
   * Implementation of this service is optional. See usage in this file for interface.
   * @type {Ember.Service}
   */
  globalViewOptions: service(),

  resource: null,

  /**
   * @type {ComputedProperty<MainContentViewOptions>}
   */
  mainContentViewOptions: or(
    'globalViewOptions.mainContentViewOptions',
    raw(Object.freeze({}))
  ),

  title: alias('resource.resourceId'),
});
