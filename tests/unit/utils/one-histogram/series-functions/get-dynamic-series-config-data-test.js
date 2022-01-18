import { expect } from 'chai';
import { describe, it } from 'mocha';
import getDynamicSeriesConfigData from 'onedata-gui-common/utils/one-histogram/series-functions/get-dynamic-series-config-data';

describe('Unit | Utility | one histogram/series functions/get dynamic series config data', function () {
  it('returns value read from context.dynamicSeriesConfig when propertyName is not provided', async function () {
    const context = { dynamicSeriesConfig: { a: 1 } };
    expect(await getDynamicSeriesConfigData(context)).to.deep.equal({
      type: 'basic',
      data: context.dynamicSeriesConfig,
    });
  });

  it('returns value read from context.dynamicSeriesConfig property when propertyName is provided',
    async function () {
      const context = { dynamicSeriesConfig: { a: 1 } };
      expect(await getDynamicSeriesConfigData(context, { propertyName: 'a' }))
        .to.deep.equal({
          type: 'basic',
          data: context.dynamicSeriesConfig.a,
        });
    });

  it('returns null when propertyName is not set in context.dynamicSeriesConfig', async function () {
    const context = { dynamicSeriesConfig: { a: 1 } };
    expect(await getDynamicSeriesConfigData(context, { propertyName: 'b' }))
      .to.deep.equal({
        type: 'basic',
        data: null,
      });
  });

  it('returns null context.dynamicSeriesConfig is not set', async function () {
    const context = {};
    expect(await getDynamicSeriesConfigData(context, { propertyName: 'b' }))
      .to.deep.equal({
        type: 'basic',
        data: null,
      });
  });
});
