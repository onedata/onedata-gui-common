/**
 * A component that is used as a cell renderer with autotruncate functionality.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/support-size-info/table/truncated-cell';

export default Component.extend({
  layout,
  tagName: '',
});
