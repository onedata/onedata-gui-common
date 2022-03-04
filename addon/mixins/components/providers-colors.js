import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import ColorGenerator from 'onedata-gui-common/utils/color-generator';

export default Mixin.create({
  guiUtils: service(),

  /**
   * @virtual
   * @type {PromiseArray<models/Provider>}
   */
  providersProxy: undefined,

  /**
   * @type {ComputedProperty<Utils.ColorGenerator>}
   */
  colorGenerator: computed(() => new ColorGenerator()),

  /**
   * Global colors for each provider
   * @type {Ember.ComputedProperty<Object>}
   */
  providersColors: computed(
    'providersProxy.{content.@each.id,isFulfilled}',
    'colorGenerator',
    function getProvidersColors() {
      const {
        providersProxy,
        colorGenerator,
        guiUtils,
      } = this.getProperties('providersProxy', 'colorGenerator', 'guiUtils');
      if (get(providersProxy, 'isFulfilled')) {
        const providerIds = get(providersProxy, 'content')
          .map(p => guiUtils.getRoutableIdFor(p))
          .sort();
        const colors = providerIds.map((providerId) =>
          colorGenerator.generateColorForKey(providerId)
        );
        return _.zipObject(providerIds, colors);
      }
    }),
});
