export default class ToggleHelper {
  constructor($toggle) {
    this.$toggle = $toggle;
  }

  getCheckbox() {
    return this.$toggle.find('input[type=checkbox]');
  }

  isChecked() {
    return this.getCheckbox().prop('checked');
  }
}
