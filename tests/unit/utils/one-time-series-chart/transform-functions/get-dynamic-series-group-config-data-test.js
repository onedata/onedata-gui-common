import { expect } from 'chai';
import { describe, it } from 'mocha';
import getDynamicSeriesGroupConfigData from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/get-dynamic-series-group-config-data';

describe('Unit | Utility | one time series chart/transform functions/get dynamic series group config data',
  function () {
    it('returns value read from context.dynamicSeriesGroupConfig when propertyName is not provided', function () {
      const context = { dynamicSeriesGroupConfig: { a: 1 } };
      expect(getDynamicSeriesGroupConfigData(context))
        .to.equal(context.dynamicSeriesGroupConfig);
    });

    it('returns value read from context.dynamicSeriesGroupConfig property when propertyName is provided',
      function () {
        const context = { dynamicSeriesGroupConfig: { a: 1 } };
        expect(getDynamicSeriesGroupConfigData(context, { propertyName: 'a' }))
          .to.equal(context.dynamicSeriesGroupConfig.a);
      });

    it('returns null when propertyName is not set in context.dynamicSeriesGroupConfig', function () {
      const context = { dynamicSeriesGroupConfig: { a: 1 } };
      expect(getDynamicSeriesGroupConfigData(context, { propertyName: 'b' }))
        .to.be.null;
    });

    it('returns null context.dynamicSeriesGroupConfig is not set', function () {
      const context = {};
      expect(getDynamicSeriesGroupConfigData(context, { propertyName: 'b' }))
        .to.be.null;
    });
  });
