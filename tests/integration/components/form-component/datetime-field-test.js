import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import { blur } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import OneDatetimePickerHelper from '../../../helpers/one-datetime-picker';
import moment from 'moment';
import { set } from '@ember/object';

const datetimeFormat = 'YYYY/MM/DD H:mm';

describe('Integration | Component | form component/datetime field', function () {
  setupComponentTest('form-component/datetime-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', DatetimeField.create());
  });

  it(
    'has class "datetime-field"',
    function () {
      this.render(hbs `{{form-component/datetime-field field=textField}}`);

      expect(this.$('.datetime-field')).to.exist;
    }
  );

  it(
    'renders text input and datetime picker',
    function () {
      this.render(hbs `{{form-component/datetime-field field=field}}`);

      expect(this.$('input')).to.exist;
      const picker = new OneDatetimePickerHelper(this.$('input'));
      return picker.openPicker()
        .then(() => expect(picker.getPickerElement()).to.exist);
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/datetime-field field=field}}`);

      expect(this.$('input')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/datetime-field field=field}}`);

      const picker = new OneDatetimePickerHelper(this.$('input'));
      return picker.openPicker(true)
        .then(() => blur('input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/datetime-field field=field}}`);

      const picker = new OneDatetimePickerHelper(this.$('input'));
      return picker.selectToday()
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(sinon.match.instanceOf(Date));
        });
    }
  );

  it('sets input value to date specified in field object', function () {
    const date = new Date();
    this.set('field.value', date);

    this.render(hbs `{{form-component/datetime-field field=field}}`);

    const expectedValue = moment(date).format(datetimeFormat);
    expect(this.$('input').val()).to.equal(expectedValue);
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `{{form-component/datetime-field field=field fieldId="abc"}}`);

    expect(this.$('input#abc')).to.exist;
  });

  it('renders raw datetime value when field is in "view" mode', function () {
    const field = this.get('field');
    const date = new Date();
    set(field, 'value', date);
    field.changeMode('view');

    this.render(hbs `{{form-component/datetime-field field=field}}`);

    expect(this.$().text().trim()).to.equal(moment(date).format(datetimeFormat));
    expect(this.$('input')).to.not.exist;
  });
});
