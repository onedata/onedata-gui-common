import { expect } from 'chai';
import { describe, it } from 'mocha';
import getDynamicSeriesGroupConfig from 'onedata-gui-common/utils/one-time-series-chart/series-functions/get-dynamic-series-group-config';

describe('Unit | Utility | one time series chart/series functions/get dynamic series group config',
  function () {
    it('returns value read from context.dynamicSeriesGroupConfig when propertyName is not provided', function () {
      const context = { dynamicSeriesGroupConfig: { a: 1 } };
      expect(getDynamicSeriesGroupConfig(context))
        .to.deep.equal({
          type: 'basic',
          data: context.dynamicSeriesGroupConfig,
        });
    });

    it('returns value read from context.dynamicSeriesGroupConfig property when propertyName is provided',
      function () {
        const context = { dynamicSeriesGroupConfig: { a: 1 } };
        expect(getDynamicSeriesGroupConfig(context, { propertyName: 'a' }))
          .to.deep.equal({
            type: 'basic',
            data: context.dynamicSeriesGroupConfig.a,
          });
      });

    it('returns null when propertyName is not set in context.dynamicSeriesGroupConfig', function () {
      const context = { dynamicSeriesGroupConfig: { a: 1 } };
      expect(getDynamicSeriesGroupConfig(context, { propertyName: 'b' }))
        .to.deep.equal({
          type: 'basic',
          data: null,
        });
    });

    it('returns null context.dynamicSeriesGroupConfig is not set', function () {
      const context = {};
      expect(getDynamicSeriesGroupConfig(context, { propertyName: 'b' }))
        .to.deep.equal({
          type: 'basic',
          data: null,
        });
    });
  });
