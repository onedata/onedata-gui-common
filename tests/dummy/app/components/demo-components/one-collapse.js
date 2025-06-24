import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DummyOneCollapseComponent extends Component {
  @tracked
  isOpened = false;

  @tracked
  transitionDuration = undefined;

  @action
  toggleOpened() {
    this.isOpened = !this.isOpened;
  }

  /**
   * @param {string} inputValue
   */
  @action
  changeTransitionDuration(inputValue) {
    this.transitionDuration = inputValue === '' ? undefined : Number(inputValue);
  }
}
