import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  fillIn,
  find,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import $ from 'jquery';
import sinon from 'sinon';
import OneTooltipHelper from '../../../helpers/one-tooltip';
import OneDropdownHelper from '../../../helpers/one-dropdown';
import _ from 'lodash';
import { resolve } from 'rsvp';
import { findInElementsByText } from '../../../helpers/find';
import globals from 'onedata-gui-common/utils/globals';

const models = [{
  name: 'user',
  translation: 'User',
}, {
  name: 'group',
  translation: 'Group',
}, {
  name: 'provider',
  translation: 'Oneprovider',
}, {
  name: 'service',
  translation: 'Service',
}, {
  name: 'serviceOnepanel',
  translation: 'Service Onepanel',
}];

const defaultSettings = {
  models: models.map(({ name }) => ({ name })),
};

const availableModels = defaultSettings.models.reduce((avModels, { name }) => {
  avModels[name] = _.times(3, i => ({
    name: `${name}${i}`,
  }));
  return avModels;
}, {});

defaultSettings.models.forEach(modelSpec => {
  modelSpec.getRecords = () => resolve(availableModels[modelSpec.name]);
});
availableModels['service'][0].serviceType = 'onezone';
availableModels['service'][0].name += 'onezone';
availableModels['serviceOnepanel'][0].serviceType = 'onezone';
availableModels['serviceOnepanel'][0].name += 'onezone';

describe('Integration | Component | tags-input/model-selector-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('settings', defaultSettings);
  });

  it('has class "tags-input-model-selector-editor"', async function () {
    await render(hbs `{{tags-input/model-selector-editor}}`);

    expect(find('.tags-input-model-selector-editor')).to.exist;
  });

  it('renders popover', async function () {
    await render(hbs `{{tags-input/model-selector-editor}}`);

    expect(getSelector()).to.exist;
  });

  it('renders list of available model types', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    await click('.tag-creator-trigger');
    expect(find('.ember-basic-dropdown-trigger')).to.have.trimmed.text('User');
    const dropdown = new OneDropdownHelper('.tags-selector');
    const optionsTexts = await dropdown.getOptionsText();
    models.mapBy('translation').forEach((translation, index) => {
      expect(optionsTexts[index]).to.equal(translation);
    });
  });

  models.forEach(({ name: typeName, translation }) => {
    it(`renders list of available models for type ${typeName}`, async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
      }}`);

      await click('.tag-creator-trigger');
      const dropdown = new OneDropdownHelper('.tags-selector');
      await dropdown.selectOptionByText(translation);
      const options = getSelector().querySelectorAll('.selector-item.record-item');
      expect(options).to.have.length(availableModels[typeName].length);
      availableModels[typeName].forEach(({ name }, index) => {
        expect(options[index].textContent.trim()).to.equal(name);
      });
    });
  });

  it('sorts list of records before rendering', async function () {
    this.get('settings.models')[0].getRecords =
      () => resolve(availableModels['user'].slice().reverse());

    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    await click('.tag-creator-trigger');
    expect($(getSelector().querySelector('.all-item')).prevAll().filter('.record-item'))
      .to.have.length(0);
    const options = getSelector().querySelectorAll('.record-item');
    availableModels['user'].forEach(({ name }, index) => {
      expect(options[index]).to.have.trimmed.text(name);
    });
  });

  it('has empty filter input by default', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    await click('.tag-creator-trigger');
    const filterInput = getSelector().querySelector('.records-filter');
    expect(filterInput.value).to.be.empty;
    expect(filterInput.placeholder).to.equal('Filter...');
  });

  it('allows to filter records', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    await click('.tag-creator-trigger');
    await fillIn(getSelector().querySelector('.records-filter'), '0');
    const options = getSelector().querySelectorAll('.selector-item');
    expect(options).to.have.length(1);
    expect(options[0]).to.have.trimmed.text('user0');
  });

  [{
    name: 'user',
    label: 'Any user',
    tip: 'Any user that has an account in Onezone',
  }, {
    name: 'group',
    label: 'Any group',
    tip: 'Any user that has at least one group',
  }, {
    name: 'provider',
    label: 'Any Oneprovider',
  }, {
    name: 'service',
    label: 'Any Oneprovider',
  }, {
    name: 'serviceOnepanel',
    label: 'Any Oneprovider Onepanel',
  }].forEach(({ name, label, tip }, index) => {
    it(`adds "${label}" item to list of records for ${name}`, async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
      }}`);

      await click('.tag-creator-trigger');
      const dropdown = new OneDropdownHelper('.tags-selector');
      await dropdown.selectOptionByText(models[index].translation);
      const allOption = getSelector().querySelector('.selector-item:not(.record-item)');
      expect(allOption).to.exist;
      expect(allOption).to.have.class('all-item');
      expect(allOption).to.have.trimmed.text(label);
      const tooltipHelper = new OneTooltipHelper(allOption);
      if (tip) {
        expect(await tooltipHelper.getText()).to.equal(tip);
      } else {
        expect(await tooltipHelper.hasTooltip()).to.be.false;
      }
    });
  });

  models.forEach(({ name: typeName, translation }) => {
    it(`does not render ${typeName} records, which are already selected`,
      async function () {
        this.set('selectedTags', defaultSettings.models.map(({ name }) => ({
          value: {
            record: availableModels[name][0],
            model: typeName,
          },
        })));

        await render(hbs `{{tags-input
          tags=selectedTags
          tagEditorComponentName="tags-input/model-selector-editor"
          tagEditorSettings=settings
        }}`);

        await click('.tag-creator-trigger');
        const dropdown = new OneDropdownHelper('.tags-selector');
        await dropdown.selectOptionByText(translation);
        const options = getSelector().querySelectorAll('.selector-item.record-item');
        expect(options).to.have.length(2);
        expect(
          findInElementsByText(options, availableModels[typeName][0].name)
        ).to.not.exist;
      }
    );

    it(`allows to add ${typeName}-type record tag by clicking on it`, async function () {
      this.set('tags', []);
      const changeSpy = sinon.spy(tags => this.set('tags', tags));
      this.set('change', changeSpy);

      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
        onChange=(action change)
      }}`);

      await click('.tag-creator-trigger');
      const dropdown = new OneDropdownHelper('.tags-selector');
      await dropdown.selectOptionByText(translation);
      await click(getSelector().querySelector('.selector-item.record-item'));
      const options = getSelector().querySelectorAll('.selector-item.record-item');
      expect(options).to.have.length(2);
      expect(
        findInElementsByText(options, availableModels[typeName][0].name)
      ).to.not.exist;
      expect(changeSpy.lastCall.args[0].mapBy('value.record'))
        .to.deep.equal([availableModels[typeName][0]]);
    });
  });

  [{
    name: 'user',
    icon: 'user',
    typeIndex: 0,
  }, {
    name: 'group',
    typeIcon: 'groups',
    icon: 'group',
    typeIndex: 1,
  }, {
    name: 'provider',
    icon: 'provider',
    typeIndex: 2,
  }, {
    name: 'service',
    typeIcon: 'cluster',
    icon: 'onezone',
    typeIndex: 3,
  }, {
    name: 'service',
    typeIcon: 'cluster',
    icon: 'provider',
    recordIndex: 1,
    typeIndex: 3,
  }, {
    name: 'serviceOnepanel',
    icon: 'onepanel',
    typeIndex: 4,
  }].forEach(({ name, icon, typeIcon, recordIndex = 0, typeIndex }) => {
    it(`uses icon ${icon} for ${recordIndex + 1}. ${name} test record`, async function () {
      this.set('tags', []);
      const changeSpy = sinon.spy(tags => this.set('tags', tags));
      this.set('change', changeSpy);

      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
        onChange=(action change)
      }}`);

      await click('.tag-creator-trigger');
      const dropdown = new OneDropdownHelper('.tags-selector');
      await dropdown.selectOptionByText(models[typeIndex].translation);
      expect(find('.ember-basic-dropdown-trigger').querySelector('.oneicon'))
        .to.have.class(`oneicon-${typeIcon || icon}`);

      const record = getSelector().querySelectorAll('.record-item')[recordIndex];
      expect(record.querySelector('.tag-icon')).to.have.class(`oneicon-${icon}`);
      await click(record);
      expect(changeSpy.lastCall.args[0].mapBy('icon')[0]).to.equal(icon);
    });
  });

  [{
    name: 'user',
    addedDescription: 'All users are already added.',
  }, {
    name: 'group',
    addedDescription: 'All groups are already added.',
  }, {
    name: 'provider',
    addedDescription: 'All Oneproviders are already added.',
  }].forEach(({ name, addedDescription }) => {
    it(`hides all records when "all records" item has been clicked for ${name}`,
      async function () {
        this.set('tags', []);
        const changeSpy = sinon.spy(tags => this.set('tags', tags));
        this.set('change', changeSpy);

        await render(hbs `{{tags-input
          tags=tags
          tagEditorComponentName="tags-input/model-selector-editor"
          tagEditorSettings=settings
          onChange=(action change)
        }}`);

        await click('.tag-creator-trigger');
        const dropdown = new OneDropdownHelper('.tags-selector');
        await dropdown.selectOptionByText(models.findBy('name', name).translation);
        expect(getSelector().querySelector('.all-records-added-description'))
          .to.not.exist;
        await click(getSelector().querySelector('.selector-item.all-item'));
        expect(changeSpy.lastCall.args[0].mapBy('value.record.representsAll')[0])
          .to.equal(name);
        expect(getSelector().querySelector('.selector-item.record-item'))
          .to.not.exist;
        expect(
          getSelector().querySelector('.all-records-added-description')
        ).to.have.trimmed.text(addedDescription);
      });
  });

  [
    'service',
    'serviceOnepanel',
  ].forEach((name) => {
    it(
      `hides all Oneprovider related records when "all records" item has been clicked for ${name}`,
      async function () {
        this.set('tags', []);
        const changeSpy = sinon.spy(tags => this.set('tags', tags));
        this.set('change', changeSpy);

        await render(hbs `{{tags-input
          tags=tags
          tagEditorComponentName="tags-input/model-selector-editor"
          tagEditorSettings=settings
          onChange=(action change)
        }}`);

        await click('.tag-creator-trigger');
        const dropdown = new OneDropdownHelper('.tags-selector');
        await dropdown.selectOptionByText(models.findBy('name', name).translation);
        expect(getSelector().querySelector('.all-records-added-description'))
          .to.not.exist;
        await click(getSelector().querySelector('.selector-item.all-item'));
        expect(changeSpy.lastCall.args[0].mapBy('value.record.representsAll')[0])
          .to.equal(name);
        const records = getSelector().querySelectorAll('.selector-item.record-item');
        expect(records).to.have.length(1);
        expect(records[0]).to.contain.text('onezone');
        expect(getSelector().querySelector('.all-records-added-description'))
          .to.not.exist;
      }
    );
  });

  it('shows list|by-id selector with preselected list', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    await click('.tag-creator-trigger');
    const listBtn = getSelector().querySelector('.btn-list');
    const byIdBtn = getSelector().querySelector('.btn-by-id');
    expect(listBtn).to.exist.and.have.class('active');
    expect(listBtn.textContent.trim()).to.equal('List');
    expect(byIdBtn).to.exist;
    expect(byIdBtn.textContent.trim()).to.equal('By ID');
  });

  it('hides list and shows ID wizard after by-id selector click', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    await click('.tag-creator-trigger');
    await click(getSelector().querySelector('.btn-by-id'));
    expect(getSelector().querySelector('.btn-by-id')).to.have.class('active');
    expect(getSelector().querySelector('.selector-list')).to.not.exist;
    expect(getSelector().querySelector('.id-description')).to.exist;
    expect(getSelector().querySelector('input[type="text"].record-id')).to.exist;
    expect(getSelector().querySelector('.btn.add-id'))
      .to.have.trimmed.text('Add ID');
  });

  [{
    name: 'user',
    label: 'User ID:',
  }, {
    name: 'group',
    label: 'Group ID:',
  }, {
    name: 'provider',
    label: 'Oneprovider ID:',
  }, {
    name: 'service',
    label: 'Oneprovider ID:',
  }, {
    name: 'serviceOnepanel',
    label: 'Oneprovider ID:',
  }].forEach(({ name, label }, index) => {
    it(`shows correct label for ${name} id field`, async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
      }}`);

      await click('.tag-creator-trigger');
      const dropdown = new OneDropdownHelper('.tags-selector');
      await dropdown.selectOptionByText(models[index].translation);
      await click(getSelector().querySelector('.btn-by-id'));
      expect(getSelector().querySelector('.id-description'))
        .to.have.trimmed.text(label);
    });
  });

  it(
    'has disabled "Add ID" button when id input is empty or has only whitespaces',
    async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
      }}`);

      await click('.tag-creator-trigger');
      await click(getSelector().querySelector('.btn-by-id'));
      expect(getSelector().querySelector('.add-id')).to.have.attr('disabled');
      await fillIn(getSelector().querySelector('.record-id'), '  ');
      expect(getSelector().querySelector('.add-id')).to.have.attr('disabled');
    }
  );

  models.forEach(({ name: modelName, translation }) => {
    it(
      `adds tag with ${modelName} ID`,
      async function () {
        this.set('tags', []);
        const changeSpy = sinon.spy(tags => this.set('tags', tags));
        this.set('change', changeSpy);

        await render(hbs `{{tags-input
          tags=tags
          tagEditorComponentName="tags-input/model-selector-editor"
          tagEditorSettings=settings
          onChange=(action change)
        }}`);

        await click('.tag-creator-trigger');
        const dropdown = new OneDropdownHelper('.tags-selector');
        await dropdown.selectOptionByText(translation);
        await click(getSelector().querySelector('.btn-by-id'));
        await fillIn(getSelector().querySelector('.record-id'), '123');
        await click(getSelector().querySelector('.add-id'));
        expect(changeSpy.lastCall.args[0].mapBy('value')[0]).to.deep.equal({
          model: modelName,
          id: '123',
        });
      }
    );
  });
});

function getSelector() {
  return globals.document.querySelector('.webui-popover.in .tags-selector');
}
