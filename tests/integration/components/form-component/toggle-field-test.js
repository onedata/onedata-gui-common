import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { focus, blur, click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import OneTooltipHelper from '../../../helpers/one-tooltip';

describe('Integration | Component | form component/toggle field', function () {
  setupComponentTest('form-component/toggle-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', ToggleField.create());
  });

  it(
    'has class "toggle-field"',
    function () {
      this.render(hbs `{{form-component/toggle-field field=field}}`);

      expect(this.$('.toggle-field')).to.exist;
    }
  );

  it(
    'renders toggle',
    function () {
      this.render(hbs `{{form-component/toggle-field field=field}}`);

      expect(this.$('.one-way-toggle')).to.exist;
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/toggle-field field=field}}`);

      expect(this.$('.one-way-toggle')).to.have.class('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/toggle-field field=field}}`);

      return focus('input')
        .then(() => blur('input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/toggle-field field=field}}`);

      return click('.one-way-toggle')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(true);
        });
    }
  );

  it('sets input value to value specified in field object', function () {
    this.set('field.value', true);

    this.render(hbs `{{form-component/toggle-field field=field}}`);

    expect(this.$('.one-way-toggle')).to.have.class('checked');
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/toggle-field field=field fieldId="abc"}}
    `);

    expect(this.$('input#abc')).to.exist;
  });

  it('renders blocked toggle when field is in "view" mode', function () {
    this.get('field').changeMode('view');

    this.render(hbs `{{form-component/toggle-field field=field}}`);

    expect(this.$('.one-way-toggle')).to.have.class('disabled');
  });

  it('shows default tooltip for disabled toggle in "edit" mode when no "disabledControlTip" is specified',
    async function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/toggle-field field=field}}`);

      expect(await getDisabledControlTip()).to.equal('Locked');
    });

  it('shows custom tooltip for disabled toggle in "edit" mode when "disabledControlTip" is specified',
    async function () {
      this.set('field.isEnabled', false);
      this.set('field.disabledControlTip', 'test');

      this.render(hbs `{{form-component/toggle-field field=field}}`);

      expect(await getDisabledControlTip()).to.equal('test');
    });

  it('does not show custom tooltip for toggle in "view" mode when "disabledControlTip" is specified',
    async function () {
      this.get('field').changeMode('view');
      this.set('field.disabledControlTip', 'test');

      this.render(hbs `{{form-component/toggle-field field=field}}`);

      expect(await getDisabledControlTip()).to.equal('Locked');
    });
});

async function getDisabledControlTip() {
  return await new OneTooltipHelper('.one-way-toggle .tooltip-container').getText();
}
