import { expect } from 'chai';
import { describe, it } from 'mocha';
import getDynamicSeriesConfig from 'onedata-gui-common/utils/one-time-series-chart/series-functions/get-dynamic-series-config';

describe('Unit | Utility | one-time-series-chart/series-functions/get-dynamic-series-config', function () {
  it('returns value read from context.dynamicSeriesConfig when propertyName is not provided', async function () {
    const context = { dynamicSeriesConfig: { a: 1 } };
    expect(await getDynamicSeriesConfig(context)).to.deep.equal({
      type: 'basic',
      data: context.dynamicSeriesConfig,
    });
  });

  it('returns value read from context.dynamicSeriesConfig property when propertyName is provided',
    async function () {
      const context = { dynamicSeriesConfig: { a: 1 } };
      expect(await getDynamicSeriesConfig(context, { propertyName: 'a' }))
        .to.deep.equal({
          type: 'basic',
          data: context.dynamicSeriesConfig.a,
        });
    });

  it('returns null when propertyName is not set in context.dynamicSeriesConfig', async function () {
    const context = { dynamicSeriesConfig: { a: 1 } };
    expect(await getDynamicSeriesConfig(context, { propertyName: 'b' }))
      .to.deep.equal({
        type: 'basic',
        data: null,
      });
  });

  it('returns null context.dynamicSeriesConfig is not set', async function () {
    const context = {};
    expect(await getDynamicSeriesConfig(context, { propertyName: 'b' }))
      .to.deep.equal({
        type: 'basic',
        data: null,
      });
  });
});
