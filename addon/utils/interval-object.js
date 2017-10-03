import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import Looper from 'onedata-gui-common/utils/looper';

export const IntervalObject = ObjectProxy.extend({
  update: undefined,
  cache: undefined,
  interval: undefined,
  isUpdating: undefined,
  content: computed.reads('cache'),

  init() {
    this._super(...arguments);
    this.set('isUpdating', false);
    const _watcher = Looper.extend({
      immediate: true,
      interval: this.interval,
    }).create();
    _watcher
      .on('tick', this._watcher.bind(this));
  },

  _watcher() {
    this.set('isUpdating', true);
    safeMethodExecution(this, 'update')
      .then(data => {
        this.setProperties({
          cache: data,
          isRejected: false,
          reason: undefined,
        });
      })
      .catch(reason => {
        this.setProperties({
            isRejected: true,
            reason,
          })
          .finally(() => this.setProperties({
            isUpdating: false,
          }));
      });
  },
});

export function computedInterval(intervalProperty, update) {
  return computed(function () {
    const interval = this[intervalProperty];
    return IntervalObject.extend({
      interval,
      update,
    }).create();
  });
}
