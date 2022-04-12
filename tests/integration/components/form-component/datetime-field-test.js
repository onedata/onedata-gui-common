import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, blur, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import sinon from 'sinon';
import OneDatetimePickerHelper from '../../../helpers/one-datetime-picker';
import moment from 'moment';
import { set } from '@ember/object';
import $ from 'jquery';

const datetimeFormat = 'YYYY/MM/DD H:mm';

describe('Integration | Component | form component/datetime field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', DatetimeField.create());
  });

  it(
    'has class "datetime-field"',
    async function () {
      await render(hbs `{{form-component/datetime-field field=textField}}`);

      expect(find('.datetime-field')).to.exist;
    }
  );

  it(
    'renders text input and datetime picker',
    async function () {
      await render(hbs `{{form-component/datetime-field field=field}}`);

      expect(find('input')).to.exist;
      const picker = new OneDatetimePickerHelper($(find('input')));
      return picker.openPicker()
        .then(() => expect(picker.getPickerElement()).to.exist);
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/datetime-field field=field}}`);

      expect(find('input').disabled).to.be.true;
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/datetime-field field=field}}`);

      const picker = new OneDatetimePickerHelper($(find('input')));
      return picker.openPicker(true)
        .then(() => blur('input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/datetime-field field=field}}`);

      const picker = new OneDatetimePickerHelper($(find('input')));
      return picker.selectToday()
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(sinon.match.instanceOf(Date));
        });
    }
  );

  it('sets input value to date specified in field object', async function () {
    const date = new Date();
    this.set('field.value', date);

    await render(hbs `{{form-component/datetime-field field=field}}`);

    const expectedValue = moment(date).format(datetimeFormat);
    expect(find('input').value).to.equal(expectedValue);
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `{{form-component/datetime-field field=field fieldId="abc"}}`);

    expect(find('input#abc')).to.exist;
  });

  it('renders raw datetime value when field is in "view" mode', async function () {
    const field = this.get('field');
    const date = new Date();
    set(field, 'value', date);
    field.changeMode('view');

    await render(hbs `{{form-component/datetime-field field=field}}`);

    expect(this.element.textContent.trim()).to.equal(moment(date).format(datetimeFormat));
    expect(find('input')).to.not.exist;
  });
});
