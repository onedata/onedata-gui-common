import { empty } from '@ember/object/computed';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-list-wrapper';

export default Component.extend({
  layout,
  classNames: ['one-list-wrapper'],

  items: null,

  isCollectionEmpty: empty('items')
});
