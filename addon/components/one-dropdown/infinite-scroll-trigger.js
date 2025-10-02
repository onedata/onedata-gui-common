/**
 * A trigger to use with InfiniteScrollDropdown - handles indexed options used for chunks
 * array.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Trigger from 'ember-power-select/components/power-select/trigger';
import template from 'onedata-gui-common/templates/components/one-dropdown/infinite-scroll-trigger';
import { layout } from '@ember-decorators/component';

@layout(template)
export default class InfiniteScrollTriggerComponent extends Trigger {}
