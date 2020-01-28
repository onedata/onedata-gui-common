import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { conditional, raw } from 'ember-awesome-macros';

export default Controller.extend({
  pointerEvents: service(),

  publicRouteElementClass: conditional(
    'pointerEvents.pointerNoneToMainContent',
    raw('no-pointer-events'),
    '',
  ),

  init() {
    this._super(...arguments);
    window.ccc = this;
  },
})
