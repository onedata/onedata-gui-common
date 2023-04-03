import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import dynamicBuilder from 'onedata-gui-common/utils/one-time-series-chart/series-builders/dynamic';

describe('Unit | Utility | one-time-series-chart/series-builders/dynamic', function () {
  it('generates multiple series based on external source and injects dynamic config into each of them',
    async function () {
      const context = {
        externalDataSources: {
          mysource: {
            fetchDynamicSeriesConfigs: sinon.spy(async () => [{ x: 1 }, { x: 2 }]),
          },
        },
        evaluateSeries: sinon.spy(async (ctx, template) => ({
          name: template.name,
          dynamicCfg: ctx.dynamicSeriesConfig,
        })),
      };
      const args = {
        dynamicSeriesConfigsSource: {
          sourceType: 'external',
          sourceSpec: {
            externalSourceName: 'mysource',
            externalSourceParameters: {
              a: 1,
            },
          },
        },
        seriesTemplate: { name: '123' },
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
      expect(context.externalDataSources.mysource.fetchDynamicSeriesConfigs)
        .to.be.calledOnce.and.to.be.calledWith(
          args.dynamicSeriesConfigsSource.sourceSpec.externalSourceParameters
        );
      expect(context.evaluateSeries).to.be.calledTwice
        .and.to.be.calledWith(
          Object.assign({}, context, { dynamicSeriesConfig: { x: 1 } }),
          args.seriesTemplate
        )
        .and.to.be.calledWith(
          Object.assign({}, context, { dynamicSeriesConfig: { x: 2 } }),
          args.seriesTemplate
        );
    });

  it('generates no series when fetching dynamic configs returns an empty array', async function () {
    const context = {
      externalDataSources: {
        mysource: {
          fetchDynamicSeriesConfigs: () => [],
        },
      },
      evaluateSeries: sinon.spy(() => {}),
    };
    const args = {
      dynamicSeriesConfigsSource: {
        sourceType: 'external',
        sourceSpec: {
          externalSourceName: 'mysource',
        },
      },
      seriesTemplate: { name: '123' },
    };

    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    expect(context.evaluateSeries).to.be.not.called;
  });

  it('generates no series when external source for dynamic configs does not exist', async function () {
    const context = {
      externalDataSources: {
        mysource: {},
      },
      evaluateSeries: sinon.spy(() => {}),
    };
    const args = {
      dynamicSeriesConfigsSource: {
        sourceType: 'external',
        sourceSpec: {
          externalSourceName: 'mysource',
        },
      },
      seriesTemplate: { name: '123' },
    };

    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    delete context.externalDataSources.mysource;
    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    expect(context.evaluateSeries).to.be.not.called;
  });

  it('generates no series when dynamicSeriesConfigsSource object is not provided', async function () {
    const context = {
      externalDataSources: {},
      evaluateSeries: sinon.spy(() => {}),
    };
    const args = {
      seriesTemplate: { name: '123' },
    };

    expect(await dynamicBuilder(context, args)).to.deep.equal([]);
    expect(context.evaluateSeries).to.be.not.called;
  });

  it('generates no series when seriesTemplate is not provided',
    async function () {
      const context = {
        externalDataSources: {
          mysource: {
            fetchDynamicSeriesConfigs: () => [{ x: 1 }, { x: 2 }],
          },
        },
        evaluateSeries: sinon.spy(() => {}),
      };
      const args = {
        dynamicSeriesConfigsSource: {
          sourceType: 'external',
          sourceSpec: {
            externalSourceName: 'mysource',
          },
        },
      };

      expect(await dynamicBuilder(context, args)).to.deep.equal([]);
      expect(context.evaluateSeries).to.be.not.called;
    });
});
