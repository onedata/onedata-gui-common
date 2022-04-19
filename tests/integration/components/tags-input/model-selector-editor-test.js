// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import sinon from 'sinon';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import OneTooltipHelper from '../../../helpers/one-tooltip';
import _ from 'lodash';
import { resolve } from 'rsvp';

const defaultSettings = {
  models: [{
    name: 'user',
  }, {
    name: 'group',
  }, {
    name: 'provider',
  }, {
    name: 'service',
  }, {
    name: 'serviceOnepanel',
  }],
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

describe('Integration | Component | tags input/model selector editor', function () {
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

    let modelTypeDropdown;
    return click('.tag-creator-trigger')
      .then(() => {
        modelTypeDropdown = new ModelTypeHelper();
        expect(modelTypeDropdown.getTrigger().innerText.trim()).to.equal('User');
        return modelTypeDropdown.open();
      })
      .then(() => {
        [
          'User',
          'Group',
          'Oneprovider',
          'Service',
          'Service Onepanel',
        ].forEach((translation, index) => {
          expect(modelTypeDropdown.getNthOption(index + 1).innerText.trim())
            .to.equal(translation);
        });
      });
  });

  defaultSettings.models.forEach(({ name: typeName }, typeIndex) => {
    it(`renders list of available models for type ${typeName}`, async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
      }}`);

      return click('.tag-creator-trigger')
        .then(() => new ModelTypeHelper().selectOption(typeIndex + 1))
        .then(() => {
          const options = getSelector().querySelectorAll('.selector-item.record-item');
          expect(options).to.have.length(availableModels[typeName].length);
          availableModels[typeName].forEach(({ name }, index) => {
            expect(options[index].textContent.trim()).to.equal(name);
          });
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

    return click('.tag-creator-trigger')
      .then(() => {
        expect($(getSelector().querySelector('.all-item')).prevAll().filter('.record-item'))
          .to.have.length(0);
        const options = getSelector().querySelectorAll('.record-item');
        availableModels['user'].forEach(({ name }, index) => {
          expect(options[index].textContent.trim()).to.equal(name);
        });
      });
  });

  it('has empty filter input by default', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    return click('.tag-creator-trigger')
      .then(() => {
        const filterInput = getSelector().querySelector('.records-filter');
        expect(filterInput.value).to.be.empty;
        expect(filterInput.placeholder).to.equal('Filter...');
      });
  });

  it('allows to filter records', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn(getSelector().querySelector('.records-filter'), '0'))
      .then(() => {
        const options = getSelector().querySelectorAll('.selector-item');
        expect(options).to.have.length(1);
        expect(options[0].textContent.trim()).to.equal('user0');
      });
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

      return click('.tag-creator-trigger')
        .then(() => new ModelTypeHelper().selectOption(index + 1))
        .then(() => {
          const allOption = getSelector().querySelector('.selector-item:not(.record-item)');
          expect(allOption).to.exist;
          expect(allOption).to.have.class('all-item');
          expect(allOption.textContent.trim()).to.equal(label);
          const tooltipHelper = new OneTooltipHelper(allOption);
          if (tip) {
            return tooltipHelper.getText()
              .then(text => expect(text).to.equal(tip));
          } else {
            return tooltipHelper.hasTooltip()
              .then(hasTooltip => expect(hasTooltip).to.be.false);
          }
        });
    });
  });

  defaultSettings.models.forEach(({ name: typeName }, index) => {
    it(
      `does not render ${typeName} records, which are already selected`,
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

        return click('.tag-creator-trigger')
          .then(() => new ModelTypeHelper().selectOption(index + 1))
          .then(() => {
            const options = getSelector().querySelectorAll('.selector-item.record-item');
            expect(options).to.have.length(2);
            expect($(options).find(
              `.tag-label:contains(${availableModels[typeName][0].name})`
            )[0]).to.not.exist;
          });
      }
    );

    it('allows to add record tag by clicking on it', async function () {
      this.set('tags', []);
      const changeSpy = sinon.spy(tags => this.set('tags', tags));
      this.set('change', changeSpy);

      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
        onChange=(action change)
      }}`);

      return click('.tag-creator-trigger')
        .then(() => new ModelTypeHelper().selectOption(index + 1))
        .then(() => click(getSelector().querySelector('.selector-item.record-item')))
        .then(() => {
          const options = getSelector().querySelectorAll('.selector-item.record-item');
          expect(options).to.have.length(2);
          expect($(options).find(
            `.tag-label:contains(${availableModels[typeName][0].name})`
          )[0]).to.not.exist;
          expect(changeSpy.lastCall.args[0].mapBy('value.record'))
            .to.deep.equal([availableModels[typeName][0]]);
        });
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
  }].forEach(({ name, icon, typeIcon, recordIndex, typeIndex }) => {
    recordIndex = recordIndex || 0;
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

      let modelTypeHelper;
      return click('.tag-creator-trigger')
        .then(() => {
          modelTypeHelper = new ModelTypeHelper();
          return modelTypeHelper.selectOption(typeIndex + 1);
        })
        .then(() => {
          expect(modelTypeHelper.getTrigger().querySelector('.oneicon'))
            .to.have.class(`oneicon-${typeIcon || icon}`);

          const record =
            getSelector().querySelectorAll('.record-item')[recordIndex];
          expect(record.querySelector('.tag-icon')).to.have.class(`oneicon-${icon}`);
          return click(record);
        })
        .then(() => {
          expect(changeSpy.lastCall.args[0].mapBy('icon')[0]).to.equal(icon);
        });
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
  }].forEach(({ name, addedDescription }, index) => {
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

        return click('.tag-creator-trigger')
          .then(() => new ModelTypeHelper().selectOption(index + 1))
          .then(() => {
            expect(getSelector().querySelector('.all-records-added-description'))
              .to.not.exist;
            return click(getSelector().querySelector('.selector-item.all-item'));
          })
          .then(() => {
            expect(changeSpy.lastCall.args[0].mapBy('value.record.representsAll')[0])
              .to.equal(name);
            expect(getSelector().querySelector('.selector-item.record-item'))
              .to.not.exist;
            expect(
              getSelector().querySelector('.all-records-added-description')
              .textContent.trim()
            ).to.equal(addedDescription);
          });
      });
  });

  [
    'service',
    'serviceOnepanel',
  ].forEach((name, index) => {
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

        return click('.tag-creator-trigger')
          .then(() => new ModelTypeHelper().selectOption(index + 4))
          .then(() => {
            expect(getSelector().querySelector('.all-records-added-description'))
              .to.not.exist;
            return click(getSelector().querySelector('.selector-item.all-item'));
          })
          .then(() => {
            expect(changeSpy.lastCall.args[0].mapBy('value.record.representsAll')[0])
              .to.equal(name);
            const records = getSelector().querySelectorAll('.selector-item.record-item');
            expect(records).to.have.length(1);
            expect(records[0].textContent).to.contain('onezone');
            expect(getSelector().querySelector('.all-records-added-description'))
              .to.not.exist;
          });
      }
    );
  });

  it('shows list|by-id selector with preselected list', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    return click('.tag-creator-trigger')
      .then(() => {
        const listBtn = getSelector().querySelector('.btn-list');
        const byIdBtn = getSelector().querySelector('.btn-by-id');
        expect(listBtn).to.exist.and.have.class('active');
        expect(listBtn.textContent.trim()).to.equal('List');
        expect(byIdBtn).to.exist;
        expect(byIdBtn.textContent.trim()).to.equal('By ID');
      });
  });

  it('hides list and shows ID wizard after by-id selector click', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/model-selector-editor"
      tagEditorSettings=settings
    }}`);

    return click('.tag-creator-trigger')
      .then(() => click(getSelector().querySelector('.btn-by-id')))
      .then(() => {
        expect(getSelector().querySelector('.btn-by-id')).to.have.class('active');
        expect(getSelector().querySelector('.selector-list')).to.not.exist;
        expect(getSelector().querySelector('.id-description')).to.exist;
        expect(getSelector().querySelector('input[type="text"].record-id')).to.exist;
        expect(getSelector().querySelector('.btn.add-id').textContent.trim())
          .to.equal('Add ID');
      });
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

      return click('.tag-creator-trigger')
        .then(() => new ModelTypeHelper().selectOption(index + 1))
        .then(() => click(getSelector().querySelector('.btn-by-id')))
        .then(() =>
          expect(getSelector().querySelector('.id-description').textContent.trim())
          .to.equal(label)
        );
    });
  });

  it(
    'has disabled "Add ID" button when id input is empty or has only whitespaces',
    async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/model-selector-editor"
        tagEditorSettings=settings
      }}`);

      return click('.tag-creator-trigger')
        .then(() => click(getSelector().querySelector('.btn-by-id')))
        .then(() => expect(getSelector().querySelector('.add-id')).to.have.attr('disabled'))
        .then(() => fillIn(getSelector().querySelector('.record-id'), '  '))
        .then(() => expect(getSelector().querySelector('.add-id')).to.have.attr('disabled'));
    }
  );

  defaultSettings.models.forEach(({ name: modelName }, index) => {
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

        return click('.tag-creator-trigger')
          .then(() => new ModelTypeHelper().selectOption(index + 1))
          .then(() => click(getSelector().querySelector('.btn-by-id')))
          .then(() => fillIn(getSelector().querySelector('.record-id'), '123'))
          .then(() => click(getSelector().querySelector('.add-id')))
          .then(() =>
            expect(changeSpy.lastCall.args[0].mapBy('value')[0]).to.deep.equal({
              model: modelName,
              id: '123',
            })
          );
      }
    );
  });
});

function getSelector() {
  return document.querySelector('.webui-popover.in .tags-selector');
}

class ModelTypeHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.ember-basic-dropdown');
  }
}
