import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/perfect-scrollbar-element';

import { PerfectScrollbarMixin } from 'ember-perfect-scrollbar';

export default Ember.Component.extend(PerfectScrollbarMixin, {
  layout,
});
