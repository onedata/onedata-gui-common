/**
 * A component responsible for rendering tags field.
 *
 * @module components/form-component/tags-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/tags-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['tags-field'],

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tags: computed('value.[]', function tags() {
    const {
      value,
      field,
      sort,
    } = this.getProperties('value', 'field', 'sort');

    const convertedTags = field.valueToTags(value);
    return sort ? field.sortTags(convertedTags) : convertedTags;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  tagEditorComponentName: reads('field.tagEditorComponentName'),

  /**
   * @type {ComputedProperty<any>}
   */
  tagEditorSettings: reads('field.tagEditorSettings'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isClearButtonVisible: reads('field.isClearButtonVisible'),

  /**
   * @type {ComputedProperty<Number|undefined>}
   */
  tagsLimit: reads('field.tagsLimit'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  sort: reads('field.sort'),

  actions: {
    valueChanged(tags) {
      const {
        sort,
        field,
      } = this.getProperties('sort', 'field');

      if (sort) {
        tags = field.sortTags(tags);
      }

      return this._super(field.tagsToValue(tags));
    },
  },
});
