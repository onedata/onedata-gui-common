import Service from '@ember/service';
import { computed } from '@ember/object';
import { A } from '@ember/array';

export default Service.extend({
  entries: computed(() => A()),

  log(message) {
    this.get('entries').unshiftObject({
      date: new Date(),
      message,
    });
  },
});
