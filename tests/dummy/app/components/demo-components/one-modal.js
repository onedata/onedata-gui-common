import Component from '@ember/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OneModalComponent extends Component {
  @tracked lipsumText = 'lorem ipsum dolor sit amet';
  @tracked lipsumCount = 100;
  @tracked lipsumOpened = false;
  @tracked basicOpened = false;

  lipsumIncrementTimer = null;

  startLipsumTimer() {
    if (this.lipsumIncrementTimer) {
      return;
    }
    this.lipsumIncrementTimer = setInterval(() => {
      this.lipsumCount += 10;
    }, 1000);
  }

  stopLipsumTimer() {
    clearInterval(this.lipsumIncrementTimer);
    this.lipsumIncrementTimer = null;
  }

  @action
  openModal(modalName) {
    switch (modalName) {
      case 'basic':
        this.basicOpened = true;
        break;
      case 'lipsum':
        this.lipsumOpened = true;
        this.startLipsumTimer();
        break;
      default:
        break;
    }
  }

  @action
  hideModal(modalName) {
    switch (modalName) {
      case 'basic':
        this.basicOpened = false;
        break;
      case 'lipsum':
        this.lipsumOpened = false;
        this.stopLipsumTimer();
        break;
      default:
        break;
    }
  }
}
