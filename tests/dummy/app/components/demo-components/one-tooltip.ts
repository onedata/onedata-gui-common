import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import sleep from 'onedata-gui-common/utils/sleep';

export default class DummyOneTooltipComponent extends Component {
  fastTestIntervalId: number | undefined = undefined;

  alreadyHoveredTimer: number | undefined = undefined;

  hoverTime = 2;

  fastTestCallback = () => this.fastTestTick();

  @tracked
  isFastTest: boolean = false;

  @tracked
  alreadyHoveredCount: number | undefined = undefined;

  @tracked
  visible = false;

  @tracked
  fastTestTooltipVisible = false;

  get alreadyHoveredStarted(): boolean {
    return this.alreadyHoveredCount !== undefined;
  }

  get alreadyHoveredFinished(): boolean {
    return this.alreadyHoveredCount !== undefined && this.alreadyHoveredCount <= 0;
  }

  get alreadyHoveredContainerText(): string {
    if (this.alreadyHoveredFinished) {
      return 'Finished';
    } else if (this.alreadyHoveredStarted) {
      return `Wait... ${this.alreadyHoveredCount}`;
    } else {
      return 'Hover me!';
    }
  }

  alreadyHoveredTick() {
    if (this.alreadyHoveredCount === undefined) {
      this.alreadyHoveredCount = this.hoverTime;
    } else if (this.alreadyHoveredCount <= 0) {
      return;
    } else {
      this.alreadyHoveredCount -= 1;
    }
    setTimeout(this.alreadyHoveredTick.bind(this), 1000);
  }

  fastTestTick() {
    this.fastTestTooltipVisible = !this.fastTestTooltipVisible;
  }

  @action
  onAlreadyHoveredStart(): void {
    if (!this.alreadyHoveredStarted) {
      this.alreadyHoveredTick();
    }
  }

  @action
  toggleFastTest(): void {
    if (this.isFastTest) {
      clearInterval(this.fastTestIntervalId);
    } else {
      this.fastTestIntervalId = setInterval(this.fastTestCallback, 200);
    }
    this.isFastTest = !this.isFastTest;
  }

  @action
  async runSingleFastTest(time: number) {
    console.log(`test: show ${time}ms`);
    this.fastTestTooltipVisible = true;
    await sleep(time);
    console.log('test: hide');
    this.fastTestTooltipVisible = false;
    await sleep(500);
  }
}
