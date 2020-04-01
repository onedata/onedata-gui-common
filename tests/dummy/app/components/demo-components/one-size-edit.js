import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

export default Component.extend({
  globalNotify: service(),

  size: 2 * Math.pow(1024, 3),

  actions: {
    saveReject() {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject('bad error');
          }, 1000);
        })
        .catch(error => {
          this.get('globalNotify').backendError('saving', error);
          throw error;
        });
    },
  },
});
