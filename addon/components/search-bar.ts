/**
 * Input for search.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import Component from '@glimmer/component';

interface SearchBarSignature {
  Args: {
    search: (expression: string) => void,
  };
  Element: HTMLInputElement;
}

export default class SearchBar extends Component<SearchBarSignature> {
  @action
  handleInput(event: InputEvent) {
    if (!(event?.target instanceof HTMLInputElement)) {
      return;
    }
    this.args.search?.(event.target.value);
  }

  @action
  handleDidInsert(element: HTMLInputElement) {
    this.args.search?.(element.value);
  }

  @action
  handleWillDestroy(element: HTMLInputElement) {
    if (element.value) {
      this.args.search?.('');
    }
  }
}
