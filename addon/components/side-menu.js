import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/side-menu';
import { PerfectScrollbarMixin } from 'ember-perfect-scrollbar';
import EmberSideMenu from 'ember-side-menu/components/side-menu';

const {
  inject: {
    service,
  },
  observer,
} = Ember;

export default EmberSideMenu.extend(PerfectScrollbarMixin, {
  layout,
  eventsBus: service(),

  isClosedObserver: observer('progress', function () {
    let {
      progress,
      eventsBus,
    } = this.getProperties('progress', 'eventsBus');

    if (progress === 0) {
      eventsBus.trigger('side-menu:close');
    }
  }),
});
