import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import generateColors from 'onedata-gui-common/utils/generate-colors';

export default Mixin.create({
  guiUtils: service(),

  /**
   * @virtual
   * @type {PromiseArray<models/Provider>}
   */
  providersProxy: undefined,

  /**
   * Global colors for each provider
   * @type {Ember.ComputedProperty<Object>}
   */
  providersColors: computed(
    'providersProxy.{content.@each.id,isFulfilled}',
    function getProvidersColors() {
      const {
        providersProxy,
        guiUtils,
      } = this.getProperties('providersProxy', 'guiUtils');
      if (get(providersProxy, 'isFulfilled')) {
        const providerIds = get(providersProxy, 'content')
          .map(p => guiUtils.getRoutableIdFor(p))
          .sort();
        const colors = generateColors(providerIds.length);
        return _.zipObject(providerIds, colors);
      }
    }),
});
