import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PrivilegesField from 'onedata-gui-common/utils/form-component/privileges-field';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { setProperties } from '@ember/object';

const privilegesGroups = [{
  groupName: 'g0',
  privileges: [
    { name: 'g0a' },
    { name: 'g0b' },
  ],
}, {
  groupName: 'g1',
  privileges: [
    { name: 'g1a' },
  ],
}];

const translations = {
  'grpT.g0': 'group0',
  'grpT.g1': 'group1',
  'prvT.g0a': 'privilege0a',
  'prvT.g0b': 'privilege0b',
  'prvT.g1a': 'privilege1a',
}

describe('Integration | Component | form component/privileges field', function () {
  setupComponentTest('form-component/privileges-field', {
    integration: true
  });

  beforeEach(function () {
    const i18nStub = sinon.stub(lookupService(this, 'i18n'), 't');
    Object.keys(translations).forEach(tPath => i18nStub
      .withArgs(tPath)
      .returns(translations[tPath])
    );

    this.set('field', PrivilegesField.create({
      privilegesGroups,
      privilegeGroupsTranslationsPath: 'grpT',
      privilegesTranslationsPath: 'prvT',
    }));
  });

  it(
    'has class "privileges-field"',
    function () {
      this.render(hbs `{{form-component/privileges-field field=field}}`);

      expect(this.$('.privileges-field')).to.exist;
    }
  );

  it(
    'renders privileges tree',
    function () {
      this.render(hbs `{{form-component/privileges-field field=field}}`);

      Object.values(translations).forEach(translation =>
        expect(this.$(`.node-text:contains(${translation})`)).to.exist
      );
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/privileges-field field=field}}`);

      expect(this.$('.one-way-toggle:not(.disabled)')).to.not.exist;
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/privileges-field field=field}}`);

      return click(
        this.$('.node-text:contains(group0) + .form-group .one-way-toggle')[0]
      ).then(() => {
        expect(valueChangedSpy).to.be.calledOnce;
        expect(valueChangedSpy).to.be.calledWith(['g0a', 'g0b']);
      });
    }
  );

  it('sets tree value to privileges specified in field object', function () {
    this.set('field.value', ['g1a']);

    this.render(hbs `{{form-component/privileges-field field=field}}`);

    expect(
      this.$('.node-text:contains(privilege1a) + .form-group .one-way-toggle')
    ).to.have.class('checked');
    // g1a privilege toggle and g1 group toggle
    expect(this.$('.one-way-toggle.checked')).to.have.length(2);
  });

  it('shows diff using actual value and default value', function () {
    setProperties(this.get('field'), {
      value: ['g0a', 'g0b', 'g1a'],
      defaultValue: ['g0a', 'g1a'],
    });

    this.render(hbs `{{form-component/privileges-field field=field}}`);

    const $modifiedLabels = this.$('.modified-node-label');
    expect($modifiedLabels).to.have.length(2);
    expect($modifiedLabels.eq(0).text().trim()).to.equal('group0');
    expect($modifiedLabels.eq(1).text().trim()).to.equal('privilege0b');
  });
});
