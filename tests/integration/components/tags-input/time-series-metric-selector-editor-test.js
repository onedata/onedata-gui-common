import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { find, findAll, click, fillIn } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import { get } from '@ember/object';

const resolutionOptions = [{
  label: '5 seconds',
  resolution: 5,
  shortName: '5s',
}, {
  label: '1 minute',
  resolution: 60,
  shortName: '1m',
}, {
  label: '1 hour',
  resolution: 60 * 60,
  shortName: '1h',
}, {
  label: '1 day',
  resolution: 24 * 60 * 60,
  shortName: '1d',
}, {
  label: '1 week',
  resolution: 7 * 24 * 60 * 60,
  shortName: '1w',
}, {
  label: '1 month',
  resolution: 30 * 24 * 60 * 60,
  shortName: '1mo',
}, {
  label: '1 year',
  resolution: 365 * 24 * 60 * 60,
  shortName: '1y',
}];

const perAggregatorPresets = [{
  resolution: 5,
  retention: 2 * 60 * 12,
  idSuffix: '5s',
  tagLabelSuffix: '5s; 1440 samp.',
}, {
  resolution: 60,
  retention: 24 * 60,
  idSuffix: '1m',
  tagLabelSuffix: '1m; 1440 samp.',
}, {
  resolution: 60 * 60,
  retention: 2 * 30 * 24,
  idSuffix: '1h',
  tagLabelSuffix: '1h; 1440 samp.',
}, {
  resolution: 24 * 60 * 60,
  retention: 2 * 12 * 30,
  idSuffix: '1d',
  tagLabelSuffix: '1d; 720 samp.',
}, {
  resolution: 7 * 24 * 60 * 60,
  retention: 10 * 52,
  idSuffix: '1w',
  tagLabelSuffix: '1w; 520 samp.',
}, {
  resolution: 30 * 24 * 60 * 60,
  retention: 10 * 12,
  idSuffix: '1mo',
  tagLabelSuffix: '1mo; 120 samp.',
}, {
  resolution: 365 * 24 * 60 * 60,
  retention: 10,
  idSuffix: '1y',
  tagLabelSuffix: '1y; 10 samp.',
}];

const aggregators = [{
  aggregator: 'sum',
  name: 'Sum',
  tagLabelName: 'sum',
}, {
  aggregator: 'max',
  name: 'Maximum',
  tagLabelName: 'max',
}, {
  aggregator: 'min',
  name: 'Minimum',
  tagLabelName: 'min',
}, {
  aggregator: 'first',
  name: 'First',
  tagLabelName: 'first',
}, {
  aggregator: 'last',
  name: 'Last',
  tagLabelName: 'last',
}];

describe('Integration | Component | tags input/time series metric selector editor', function () {
  setupComponentTest('tags-input/time-series-metric-selector-editor', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      tags: [],
      changeSpy: sinon.spy((tags) => this.set('tags', tags)),
    });
  });

  it('has class "tags-input-time-series-metric-selector-editor"', function () {
    this.render(hbs `{{tags-input/time-series-metric-selector-editor}}`);

    expect(find('.tags-input-time-series-metric-selector-editor')).to.exist;
  });

  it('renders popover', function () {
    this.render(hbs `{{tags-input/time-series-metric-selector-editor}}`);

    expect(getSelector()).to.exist;
  });

  it('renders possible aggregators', async function () {
    this.render(hbs `{{tags-input
      tagEditorComponentName="tags-input/time-series-metric-selector-editor"
    }}`);

    await click('.tag-creator-trigger');
    await clickTrigger('.aggregator-dropdown');

    const options = document.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(aggregators.length);
    aggregators.forEach(({ name }, index) =>
      expect(options[index].textContent.trim()).to.equal(name)
    );
  });

  aggregators.forEach(({
    aggregator,
    name: aggregatorName,
    tagLabelName: aggregatorTagLabelName,
  }, aggregatorIdx) => {
    it(`shows presets for "${aggregator}" aggregator`, async function () {
      this.render(hbs `{{tags-input
          tagEditorComponentName="tags-input/time-series-metric-selector-editor"
        }}`);

      await click('.tag-creator-trigger');
      await selectChoose('.aggregator-dropdown', aggregatorName);

      const options = getSelector().querySelectorAll('.selector-item');
      expect(options).to.have.length(perAggregatorPresets.length);
      perAggregatorPresets.forEach((preset, presetIdx) =>
        expect(options[presetIdx].textContent.trim()).to.equal(
          getFullPresetLabel(aggregatorIdx, presetIdx)
        )
      );
    });

    it('allows to select presets for "${aggregator}" aggregator', async function () {
      this.render(hbs `{{tags-input
          tags=tags
          tagEditorComponentName="tags-input/time-series-metric-selector-editor"
          onChange=changeSpy
        }}`);

      await click('.tag-creator-trigger');
      await selectChoose('.aggregator-dropdown', aggregatorName);

      for (let i = 0; i < perAggregatorPresets.length; i++) {
        await click(getSelector().querySelector('.selector-item'));
        const lastChange = this.get('changeSpy').lastCall.args[0];
        expect(lastChange).to.have.length(i + 1);
        const newTagValue = get(lastChange[i], 'value');
        expect(newTagValue).to.deep.equal({
          id: `${aggregator}${perAggregatorPresets[i].idSuffix}`,
          aggregator,
          resolution: perAggregatorPresets[i].resolution,
          retention: perAggregatorPresets[i].retention,
        });
        expect(findAll('.tags-input .tag-label').reverse()[0].textContent.trim())
          .to.equal(getFullPresetLabel(aggregatorIdx, i));
      }
    });

    it(`allows to create custom tag for ${aggregator} aggregator`, async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/time-series-metric-selector-editor"
        onChange=changeSpy
      }}`);

      await click('.tag-creator-trigger');
      await selectChoose('.aggregator-dropdown', aggregatorName);
      await click('.btn-custom');
      await fillIn('.id-field input', String(aggregatorIdx));
      await selectChoose('.resolution-field', '1 minute');
      await fillIn('.retention-field input', 123);
      await click('.submit-custom-metric');

      expect(this.get('changeSpy.lastCall.args.0.0.value')).to.deep.equal({
        id: String(aggregatorIdx),
        aggregator,
        resolution: perAggregatorPresets[1].resolution,
        retention: 123,
      });
      expect(findAll('.tags-input .tag-label').reverse()[0].textContent.trim())
        .to.equal(`"${aggregatorIdx}" (${aggregatorTagLabelName}; 1m; 123 samp.)`);
    });
  });

  resolutionOptions.forEach((resolutionOption, resolutionIdx) => {
    it(`allows to create custom tag for ${resolutionOption.label} resolution`, async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/time-series-metric-selector-editor"
        onChange=changeSpy
      }}`);

      await click('.tag-creator-trigger');
      await selectChoose('.aggregator-dropdown', 'Sum');
      await click('.btn-custom');
      await fillIn('.id-field input', String(resolutionIdx));
      await selectChoose('.resolution-field', resolutionOption.label);
      await fillIn('.retention-field input', 123);
      await click('.submit-custom-metric');

      expect(this.get('changeSpy.lastCall.args.0.0.value')).to.deep.equal({
        id: String(resolutionIdx),
        aggregator: aggregators[0].aggregator,
        resolution: resolutionOption.resolution,
        retention: 123,
      });
      expect(findAll('.tags-input .tag-label').reverse()[0].textContent.trim())
        .to.equal(`"${resolutionIdx}" (sum; ${resolutionOption.shortName}; 123 samp.)`);
    });
  });

  it('marks custom metric ID as invalid when it is already used by existing tag', async function () {
    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/time-series-metric-selector-editor"
      onChange=changeSpy
    }}`);

    await click('.tag-creator-trigger');
    await click(getSelector().querySelector('.selector-item'));
    await click('.btn-custom');
    await fillIn(
      '.id-field input',
      `${aggregators[0].aggregator}${perAggregatorPresets[0].idSuffix}`
    );

    expect(find('.id-field .field-message').textContent.trim()).to.equal(
      'This ID is already used'
    );
  });

  it('marks custom metric resolution as invalid when it is already used by existing tag with the same aggregator',
    async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/time-series-metric-selector-editor"
        onChange=changeSpy
      }}`);

      await click('.tag-creator-trigger');
      await click(getSelector().querySelector('.selector-item'));
      await click('.btn-custom');

      expect(find('.resolution-field .field-message').textContent.trim()).to.equal(
        'This resolution is already used for selected aggregator'
      );
    });

  it('marks custom metric resolution as valid when it is already used by existing tag with different aggregator',
    async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/time-series-metric-selector-editor"
        onChange=changeSpy
      }}`);

      await click('.tag-creator-trigger');
      await click(getSelector().querySelector('.selector-item'));
      await selectChoose('.aggregator-dropdown', aggregators[1].name);
      await click('.btn-custom');

      expect(find('.resolution-field .field-message')).to.not.exist;
    });

  it('disabled presets when custom conflicting tags exists', async function () {
    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/time-series-metric-selector-editor"
      onChange=changeSpy
    }}`);

    await click('.tag-creator-trigger');
    await click('.btn-custom');
    await fillIn('.id-field input', 'someId');
    await click('.submit-custom-metric');
    await click('.btn-presets');

    expect(findAll('.selector-item.disabled')).to.have.length(1);

    await selectChoose('.aggregator-dropdown', aggregators[1].name);

    expect(findAll('.selector-item.disabled')).to.have.length(0);
  });
});

function getSelector() {
  return document.querySelector('.webui-popover.in .tags-selector');
}

function getFullPresetLabel(aggregatorIdx, presetIdx) {
  const aggregator = aggregators[aggregatorIdx];
  const preset = perAggregatorPresets[presetIdx];
  return `"${aggregator.aggregator}${preset.idSuffix}" (${aggregator.tagLabelName}; ${preset.tagLabelSuffix})`;
}
