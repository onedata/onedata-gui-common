import Component from '@ember/component';
import FastDoubleClick from 'onedata-gui-common/mixins/components/fast-double-click';

export default Component.extend(FastDoubleClick, {
  tagName: 'button',
});
