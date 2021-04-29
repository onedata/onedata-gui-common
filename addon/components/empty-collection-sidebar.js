import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/empty-collection-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { camelize } from '@ember/string';

export default Component.extend(I18n, {
  layout,
  classNames: ['empty-collection-sidebar'],

  i18nPrefix: 'components.emptyCollectionSidebar',

  /**
   * @virtual
   * @type {String}
   */
  resourceType: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showGetStarted: true,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  noResourcesTranslation: computed(
    'resourceType',
    function noResourcesTranslation() {
      const resourceTypeTranslation = this.t(
        `resourceTypes.${camelize(this.get('resourceType'))}`, {}, {
          defaultValue: null,
        });

      return resourceTypeTranslation ? this.t('noResources', {
        resourceType: resourceTypeTranslation,
      }) : '';
    }
  ),
});
