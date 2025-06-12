/**
 * Extension of ember-bootstrap modal footer, that fixes some bugs.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import Component from '@glimmer/component';

interface OneModalFooterSignature {
  Element: HTMLFormElement;
  Args: OneModalFooterArgs;
}

interface OneModalFooterArgs {
  onSubmit: () => void;
}

export default class OneModalFooter extends Component<OneModalFooterSignature> {
  /**
   * Fix for submit bubbling in ember-bootstrap v4 (it was prevented in ember-bootstrap
   * v3, but has been deleted and as of June 2025 it is still missing in v6.5.0).
   */
  @action
  doSubmit(event?: SubmitEvent): void {
    event?.preventDefault();
    return this.args.onSubmit();
  }
}
