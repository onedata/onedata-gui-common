export default class ToggleHelper {
  constructor($toggle) {
    this.$toggle = $toggle;
  }

  isChecked() {
    return this.$toggle.hasClass('checked');
  }
}
