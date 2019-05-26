import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/main-content';

export default Component.extend({
  layout,
  classNames: ['main-content'],

  resource: null,

  title: alias('resource.resourceId')
});
