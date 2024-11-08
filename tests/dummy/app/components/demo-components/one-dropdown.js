import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import _ from 'lodash';
import { guidFor } from '@ember/object/internals';

export default Component.extend({
      /**
       * OneDropdown small value
       * @type {String}
       */
      valueSmall: undefined,

      /**
       * OneDropdown pseudo-text
       * @type {String}
       */
      valueSmallText = 'very long text very';

      get optionsWithGroups() {
        return ['hello', 'world', 'foo', 'bar'].map(groupName => {
          return {
            groupName,
            options: _.range(0, 5).map(i => `${groupName}-${i}`),
          };
        });
      }

      get manyInfiniteOptions() {
        return _.range(0, 10000);
      }

      get infiniteScrollToggleId() {
        return `use-infinite-scroll-${guidFor(this)}`;
      }

      get manyItemsComponent() {
        return this.isInfiniteScrollComponent ? 'infinite-scroll-dropdown' : 'one-dropdown';
      }

      get manyItemsSizeToggleId() {
        return `many-items-size-${guidFor(this)}`;
      }

      get manyItemsSize() {
        return this.isManyItemsComponentSmall ? 'small' : '';
      }

      get adaptiveOptions() {
        return _.range(0, this.adaptiveOptionsCount).map(String);
      }

      @action
      updateValue(newValue) {
        this.value = newValue;
      }

      @action
      updateAdaptiveOptionsCount(event) {
        this.adaptiveOptionsCount = event.target.value;
      }
    }
