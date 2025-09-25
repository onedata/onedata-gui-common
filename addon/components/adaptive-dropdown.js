import Component from '@glimmer/component';

export default class AdaptiveDropdownComponent extends Component {
  /** @type {number} */
  minOptionsForInfiniteScroll = 50;

  get dropdownComponentName() {
    return (this.args.options?.length ?? 0) >= this.minOptionsForInfiniteScroll ?
      'infinite-scroll-dropdown' : 'one-dropdown';
  }
}
