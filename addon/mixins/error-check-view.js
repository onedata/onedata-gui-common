/**
 * Use this mixin in components/views that can show error but optionally you
 * want to check if the error still exists before rendering.
 * 
 * @module mixins/error-check-view
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';

export default Mixin.create(
  createDataProxyMixin('errorCheck'),
  createDataProxyMixin('tryErrorCheck'), {
    // virtual resourceId: string (can be computed)
    // virtual checkErrorType: string (can be computed)
    // virtual checkError: Function() => Boolean
    // virtual redirectToIndex: Function() => any

    disabledErrorCheckList: computed('checkErrorType', function disabledErrorCheckList() {
      return new DisabledErrorCheckList(this.get('checkErrorType'));
    }),

    init() {
      this._super(...arguments);
      this.updateTryErrorCheckProxy();
    },

    /**
     * @override
     */
    fetchTryErrorCheck() {
      return resolve(this.tryCheckError());
    },

    /**
     * @override
     */
    fetchErrorCheck() {
      return resolve(this.checkError());
    },

    tryCheckError() {
      const {
        disabledErrorCheckList,
        resourceId,
      } = this.getProperties('disabledErrorCheckList', 'resourceId');
      if (disabledErrorCheckList.hasEnabledErrorCheckFor(resourceId)) {
        return this.getErrorCheckProxy()
          .then(isError => {
            if (!isError) {
              this.redirectToIndex();
            }
            return isError;
          });
      } else {
        disabledErrorCheckList.enableErrorCheckFor(resourceId);
      }
    },
  });
