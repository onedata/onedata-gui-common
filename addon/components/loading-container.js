import Component from '@ember/component';
import { computed } from '@ember/object';

import layout from '../templates/components/loading-container';

export default Component.extend({
  layout,
  tagName: '',

  isLoaded: computed('isLoading', 'isError', function () {
    return !this.get('isLoading') && !this.get('isError');
  }),
  isLoading: undefined,
  isError: computed('errorReason', function () {
    return this.get('errorReason') != null;
  }),
  errorReason: undefined,
  customErrorMessage: undefined,
});
