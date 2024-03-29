import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/side-menu';
import PerfectScrollbarMixin from 'onedata-gui-common/mixins/perfect-scrollbar';
import EmberSideMenu from 'ember-side-menu/components/side-menu';

export default EmberSideMenu.extend(PerfectScrollbarMixin, {
  layout,
  eventsBus: service(),

  isClosedObserver: observer('progress', function () {
    const {
      progress,
      eventsBus,
    } = this.getProperties('progress', 'eventsBus');

    if (progress === 0) {
      eventsBus.trigger('side-menu:close');
    }
  }),
});
