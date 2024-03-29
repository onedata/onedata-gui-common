/**
 * A parent for all routes for authenticated user
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { A } from '@ember/array';
import { Promise } from 'rsvp';
import AppModel from 'onedata-gui-common/utils/app-model';
import config from 'ember-get-config';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import _object from 'lodash/object';
import { inject as service } from '@ember/service';

const {
  onedataTabs,
} = config;

export default Route.extend(AuthenticatedRouteMixin, {
  urlActionRunner: service(),

  model() {
    const mainMenuItems = A(onedataTabs).map(item =>
      _object.assign({}, item, { disabled: false })
    );

    return Promise.resolve(AppModel.create({ mainMenuItems }));
  },

  afterModel(model, transition) {
    const superResult = this._super(...arguments);

    this.urlActionRunner.runFromTransition(transition);
    // Remove action-related query params to simplify visible URL
    this.urlActionRunner.clearActionQueryParams(transition);

    return superResult;
  },
});
