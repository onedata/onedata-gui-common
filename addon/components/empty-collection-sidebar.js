import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/empty-collection-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['empty-collection-sidebar'],

  i18nPrefix: 'components.emptyCollectionSidebar',
});
