import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import PrivilegesField from 'onedata-gui-common/utils/form-component/privileges-field';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { setProperties } from '@ember/object';
import { set } from '@ember/object';
import { findInElementsByText } from '../../../helpers/find';
import dom from 'onedata-gui-common/utils/dom';

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
};

describe('Integration | Component | form-component/privileges-field', function () {
  setupRenderingTest();

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

  it('has class "privileges-field"', async function () {
    await render(hbs `{{form-component/privileges-field field=field}}`);

    expect(find('.privileges-field')).to.exist;
  });

  it('renders privileges tree', async function () {
    await render(hbs `{{form-component/privileges-field field=field}}`);

    Object.values(translations).forEach(translation => {
      expect(findInElementsByText(findAll('.node-text'), translation)).to.exist;
    });
  });

  it('can be disabled', async function () {
    this.set('field.isEnabled', false);

    await render(hbs `{{form-component/privileges-field field=field}}`);

    expect(find('.one-way-toggle:not(.disabled)')).to.not.exist;
  });

  it('notifies field object about changed value', async function () {
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

    await render(hbs `{{form-component/privileges-field field=field}}`);
    const toggle = findToggleNextToText(this, 'group0');

    await click(toggle);
    expect(valueChangedSpy).to.be.calledOnce;
    expect(valueChangedSpy).to.be.calledWith({
      privilegesTarget: undefined,
      privileges: ['g0a', 'g0b'],
    });
  });

  it('sets tree value to privileges specified in field object', async function () {
    this.set('field.value', { privileges: ['g1a'] });

    await render(hbs `{{form-component/privileges-field field=field}}`);
    const toggle = findToggleNextToText(this, 'privilege1a');

    expect(toggle).to.have.class('checked');
    // g1a privilege toggle and g1 group toggle
    expect(findAll('.one-way-toggle.checked')).to.have.length(2);
  });

  it('shows diff using actual value and default value', async function () {
    setProperties(this.get('field'), {
      value: { privileges: ['g0a', 'g0b', 'g1a'] },
      defaultValue: { privileges: ['g0a', 'g1a'] },
    });

    await render(hbs `{{form-component/privileges-field field=field}}`);

    const modifiedLabels = findAll('.modified-node-label');
    expect(modifiedLabels).to.have.length(2);
    expect(modifiedLabels[0].textContent.trim()).to.equal('group0');
    expect(modifiedLabels[1].textContent.trim()).to.equal('privilege0b');
  });

  it('renders readonly active privileges when field is in "view" mode', async function () {
    const field = this.get('field');
    set(field, 'value', { privileges: ['g1a'] });
    field.changeMode('view');

    await render(hbs `{{form-component/privileges-field field=field}}`);
    const toggle = findToggleNextToText(this, 'privilege1a');

    expect(toggle).to.have.class('checked');
    expect(find('.one-way-toggle:not(.disabled)')).to.not.exist;
  });
});

/**
 * @param {Mocha.Context} mochaContext
 * @param {string} text
 * @returns {HTMLElement}
 */
function findToggleNextToText(mochaContext, text) {
  const nodeTexts = mochaContext.element.querySelectorAll('.node-text');
  const groupNodeText = findInElementsByText(nodeTexts, text);
  if (!groupNodeText) {
    return null;
  }
  const formGroup = dom.siblings(groupNodeText).find(sibling =>
    sibling.matches('.form-group')
  );
  return formGroup?.querySelector('.one-way-toggle');
}
