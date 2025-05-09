/**
 * Override this empty component to put some content before app-layout element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import Controller from '@ember/controller';

export type OnedataBeforeComponentArgs = {
  /**
   * A controller instance injected from the level of "onedata" route.
   */
  controller: Controller;
};

export default class OnedataBeforeComponent<
  ArgsT extends OnedataBeforeComponentArgs = OnedataBeforeComponentArgs,
> extends Component<ArgsT> {}
