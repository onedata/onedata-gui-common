/**
 * A resource loading error message intended to use on whole application screen
 *
 * @module components/application-error
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/application-error';

import getErrorDetails from 'onedata-gui-common/utils/get-error-description';

const {
  computed,
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['application-error', 'fixed-center'],

  showDetails: false,

  /**
   * To inject.
   * An object with error details, that should be parseable by getErrorDetails
   * @type {object}
   */
  error: null,

  /**
   * Displayed error details generated from reason error object
   * @type {string}
   */
  _reasonDetails: computed('error', function () {
    let error = this.get('error');
    return error && getErrorDetails(error);
  }),

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
  },
});
