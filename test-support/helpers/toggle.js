export default class ToggleHelper {
  constructor(toggle) {
    this.toggle = toggle;
  }

  isChecked() {
    return this.toggle.matches('.checked');
  }
}
