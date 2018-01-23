import Component from '@ember/component';
import { computed } from '@ember/object';
import { readOnly, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/main-menu';

// singleton
export default Component.extend({
  layout,
  mainMenu: service(),
  eventsBus: service(),

  tagName: 'ul',
  classNames: ['main-menu', 'one-list'],
  classNameBindings: ['sidenavOpened:sidenav-opened'],

  appModel: null,

  currentItemId: null,
  sidenavItemId: null,

  /**
   * @type {function}
   * @param {string} id
   * @return {undefined}
   */
  itemClicked: () => {},

  isLoadingItem: reads('mainMenu.isLoadingItem'),
  isFailedItem: reads('mainMenu.isFailedItem'),

  sidenavOpened: computed('sidenavItemId', function () {
    return this.get('sidenavItemId') != null;
  }).readOnly(),

  items: readOnly('appModel.mainMenuItems'),

  actions: {
    itemClicked({
      id
    }) {
      this.get('itemClicked')(id);
    }
  }
});
