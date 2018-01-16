import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/empty-collection-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Ember.Component.extend(I18n, {
  layout,
  classNames: ['empty-collection-sidebar'],

  i18nPrefix: 'components.emptyCollectionSidebar',
});
