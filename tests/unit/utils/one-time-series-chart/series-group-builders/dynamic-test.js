import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import dynamicBuilder from 'onedata-gui-common/utils/one-time-series-chart/series-group-builders/dynamic';

describe('Unit | Utility | one time series chart/series group builders/dynamic', function () {
  it('generates multiple series groups based on external source and injects dynamic config into each of them',
    async function () {
      const context = {
        externalDataSources: {
          mysource: {
            fetchDynamicSeriesGroupConfigs: sinon.spy(async () => [{ x: 1 }, { x: 2 }]),
          },
        },
        evaluateSeriesGroup: sinon.spy((ctx, template) => ({
          name: template.name,
          dynamicCfg: ctx.dynamicSeriesGroupConfig,
        })),
      };
      const args = {
        dynamicSeriesGroupConfigsSource: {
          sourceType: 'external',
          sourceSpec: {
            externalSourceName: 'mysource',
            externalSourceParameters: {
              a: 1,
            },
          },
        },
        seriesGroupTemplate: { name: '123' },
      };

      expect(await dynamicBuilder(context, args)).to.deep.equal([{
        name: '123',
        dynamicCfg: {
          x: 1,
        },
      }, {
        name: '123',
        dynamicCfg: {
          x: 2,
        },
      }]);
      expect(context.externalDataSources.mysource.fetchDynamicSeriesGroupConfigs)
        .to.be.calledOnce.and.to.be.calledWith(
          args.dynamicSeriesGroupConfigsSource.sourceSpec.externalSourceParameters
        );
      expect(context.evaluateSeriesGroup).to.be.calledTwice
        .and.to.be.calledWith(
          Object.assign({}, context, { dynamicSeriesGroupConfig: { x: 1 } }),
          args.seriesGroupTemplate
        )
        .and.to.be.calledWith(
          Object.assign({}, context, { dynamicSeriesGroupConfig: { x: 2 } }),
          args.seriesGroupTemplate
        );
    });

  it('generates no series groups when fetching dynamic configs returns an empty array', async function () {
    const context = {
      externalDataSources: {
        mysource: {
          fetchDynamicSeriesGroupConfigs: () => [],
        },
      },
      evaluateSeriesGroup: sinon.spy(() => {}),
    };
    const args = {
      dynamicSeriesGroupConfigsSource: {
        sourceType: 'external',
        sourceSpec: {
          externalSourceName: 'mysource',
        },
      },
      seriesGroupTemplate: { name: '123' },
    };

    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    expect(context.evaluateSeriesGroup).to.be.not.called;
  });

  it('generates no series groups when external source for dynamic configs does not exist', async function () {
    const context = {
      externalDataSources: {
        mysource: {},
      },
      evaluateSeriesGroup: sinon.spy(() => {}),
    };
    const args = {
      dynamicSeriesGroupConfigsSource: {
        sourceType: 'external',
        sourceSpec: {
          externalSourceName: 'mysource',
        },
      },
      seriesGroupTemplate: { name: '123' },
    };

    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    delete context.externalDataSources.mysource;
    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    expect(context.evaluateSeriesGroup).to.be.not.called;
  });

  it('generates no series groups when dynamicSeriesGroupConfigsSource object is not provided', async function () {
    const context = {
      externalDataSources: {},
      evaluateSeriesGroup: sinon.spy(() => {}),
    };
    const args = {
      seriesGroupTemplate: { name: '123' },
    };

    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    expect(context.evaluateSeriesGroup).to.be.not.called;
  });

  it('generates no series groups when seriesGroupTemplate is not provided',
    async function () {
      const context = {
        externalDataSources: {
          mysource: {
            fetchDynamicSeriesGroupConfigs: () => [{ x: 1 }, { x: 2 }],
          },
        },
        evaluateSeriesGroup: sinon.spy(() => {}),
      };
      const args = {
        dynamicSeriesGroupConfigsSource: {
          sourceType: 'external',
          sourceSpec: {
            externalSourceName: 'mysource',
          },
        },
      };

      expect(await dynamicBuilder(context, args)).to.deep.equal([]);
      expect(context.evaluateSeriesGroup).to.be.not.called;
    });
});
