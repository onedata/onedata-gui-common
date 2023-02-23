import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  createDummyChartDefinition,
  createDummyConfiguration,
  createModel,
  expectResolutions,
  expectActiveResolution,
  changeResolution,
} from '../../../helpers/one-time-series-chart';
import { get } from '@ember/object';
import { all as allFulfilled } from 'rsvp';
import { render, settled, click, find } from '@ember/test-helpers';

describe('Integration | Component | one-time-series-chart/toolbar', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    const models = this.get('models');
    if (models) {
      models.forEach(model => model.destroy());
    }
  });

  it('has class "one-time-series-chart-toolbar"', async function () {
    await renderComponent();

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('one-time-series-chart-toolbar');
  });

  it('renders time resolutions according to the resolutions defined in a single model',
    async function () {
      const [model] = setupModels(this, [{
        chartDefinition: createDummyChartDefinition(),
        timeResolutionSpecs: [{
          timeResolution: 60,
        }, {
          timeResolution: 3600,
        }, {
          timeResolution: 48 * 3600,
        }],
        externalDataSources: {
          dummy: {
            fetchSeries: () => [],
          },
        },
      }]);
      model.setViewParameters({ timeResolution: 48 * 3600 });

      await renderComponent();

      await expectResolutions(['1 min', '1 hr', '2 days']);
      expectActiveResolution('2 days');
    });

  it('renders time resolutions according to the resolutions defined in multiple models',
    async function () {
      const [model1, model2] = setupModels(this, [{
        chartDefinition: createDummyChartDefinition(),
        timeResolutionSpecs: [{
          timeResolution: 5,
        }, {
          timeResolution: 60,
        }, {
          timeResolution: 3600,
        }, {
          timeResolution: 48 * 3600,
        }],
        externalDataSources: {
          dummy: {
            fetchSeries: () => [],
          },
        },
      }, {
        chartDefinition: createDummyChartDefinition(),
        timeResolutionSpecs: [{
          timeResolution: 60,
        }, {
          timeResolution: 3600,
        }, {
          timeResolution: 7200,
        }, {
          timeResolution: 48 * 3600,
        }],
        externalDataSources: {
          dummy: {
            fetchSeries: () => [],
          },
        },
      }]);
      model1.setViewParameters({ timeResolution: 3600 });
      model2.setViewParameters({ timeResolution: 3600 });

      await renderComponent();

      await expectResolutions(['1 min', '1 hr', '2 days']);
      expectActiveResolution('1 hr');
    });

  it('changes time resolution of all models', async function () {
    const [model1, model2] = setupModels(this, [{
      chartDefinition: createDummyChartDefinition(),
      timeResolutionSpecs: [{
        timeResolution: 60,
      }, {
        timeResolution: 3600,
      }],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    }, {
      chartDefinition: createDummyChartDefinition(),
      timeResolutionSpecs: [{
        timeResolution: 60,
      }, {
        timeResolution: 3600,
      }],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    }]);
    model1.setViewParameters({ timeResolution: 60 });
    model2.setViewParameters({ timeResolution: 60 });
    await renderComponent();

    await changeResolution('1 hr');

    expectActiveResolution('1 hr');
    expect(get(model1, 'lastViewParameters.timeResolution')).to.equal(3600);
    expect(get(model2, 'lastViewParameters.timeResolution')).to.equal(3600);
  });

  it('relfects change of models time resolution', async function () {
    const [model] = setupModels(this, [{
      chartDefinition: createDummyChartDefinition(),
      timeResolutionSpecs: [{
        timeResolution: 60,
      }, {
        timeResolution: 3600,
      }],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    }]);
    model.setViewParameters({ timeResolution: 60 });
    await renderComponent();

    model.setViewParameters({ timeResolution: 3600 });
    await settled();

    expectActiveResolution('1 hr');
  });

  it('blocks "newer" and "newest" buttons when charts show the newest points', async function () {
    setupModels(this, [
      createDummyConfiguration(),
      createDummyConfiguration(),
    ]);
    await waitForModelStates(this);

    await renderComponent();

    expectDisabledNavigation(['newer', 'newest']);
  });

  it('allows to move to the newest points (all charts)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(0, 4000000),
      createDummyConfiguration(0, 3000000),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1000000,
    });
    model1.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('newest');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(3999960);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(3000000);
  });

  it('allows to move to the newest points (one chart)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(0, 4000000),
      createDummyConfiguration(0, 3000000),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('newest');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(3999960);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(3000000);
  });

  it('allows to move to newer points (all charts, not overlaping)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(),
      createDummyConfiguration(),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1000000,
    });
    model2.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('newer');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(1003560);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(1999980);
  });

  it('allows to move to newer points (all charts, partially overlaping)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(),
      createDummyConfiguration(),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1999800,
    });
    model2.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('newer');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(2003400);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(2003400);
  });

  it('allows to move to newer points (one chart)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(0, 1000000),
      createDummyConfiguration(),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1000000,
    });
    model2.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('newer');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(999960);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(2003580);
  });

  it('allows to move to older points (all charts, not overlaping)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(),
      createDummyConfiguration(),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1000000,
    });
    model2.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('older');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(999960);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(1996380);
  });

  it('allows to move to older points (all charts, partially overlaping)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(),
      createDummyConfiguration(),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1999800,
    });
    model2.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('older');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(1996380);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(1996380);
  });

  it('allows to move to older points (one chart)', async function () {
    const [model1, model2] = setupModels(this, [
      createDummyConfiguration(996400, 2000000),
      createDummyConfiguration(),
    ]);
    model1.setViewParameters({
      lastPointTimestamp: 1000000,
    });
    model2.setViewParameters({
      lastPointTimestamp: 2000000,
    });
    await waitForModelStates(this);
    await renderComponent();

    await clickNavBtn('older');

    expect(get(model1, 'state').lastPointTimestamp).to.equal(999960);
    expect(get(model2, 'state').lastPointTimestamp).to.equal(1996380);
  });
});

async function renderComponent() {
  await render(hbs `{{one-time-series-chart/toolbar models=models}}`);
}

function setupModels(testCase, configInitOptionsArr) {
  return testCase.set(
    'models',
    configInitOptionsArr.map(initConfig => createModel(initConfig))
  );
}

function expectDisabledNavigation(disabledButtons) {
  const buttons = {
    older: find('.show-older-btn'),
    newer: find('.show-newer-btn'),
    newest: find('.show-newest-btn'),
  };

  Object.keys(buttons).forEach((button) => {
    if (disabledButtons.includes(button)) {
      expect(buttons[button].disabled).to.be.true;
    } else {
      expect(buttons[button].disabled).to.be.false;
    }
  });
}

async function clickNavBtn(btnName) {
  await click(`.show-${btnName}-btn`);
}

async function waitForModelStates(testCase) {
  await allFulfilled(testCase.get('models').mapBy('stateProxy'));
}
