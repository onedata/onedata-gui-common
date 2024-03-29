import Component from '@ember/component';
import { computed } from '@ember/object';
import {
  createModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

export default Component.extend({
  isReadOnly: false,

  dashboardModel: computed('dataSources', function dashboardModel() {
    return createModelFromSpec(null, this, this.dataSources);
  }),

  dataSources: Object.freeze([{
    originName: 'abc',
    collectionRef: 'store-abc',
    timeSeriesCollectionSchema: {
      timeSeriesSchemas: [{
        unit: 'bytes',
        nameGeneratorType: 'exact',
        nameGenerator: 'bytesUnpacked',
        metrics: {
          sum5s: {
            retention: 1440,
            resolution: 5,
            aggregator: 'sum',
          },
          sum1m: {
            retention: 1440,
            resolution: 60,
            aggregator: 'sum',
          },
          sum1h: {
            retention: 1440,
            resolution: 3600,
            aggregator: 'sum',
          },
        },
      }, {
        unit: 'none',
        nameGeneratorType: 'exact',
        nameGenerator: 'filesUnpacked',
        metrics: {
          sum5s: {
            retention: 1440,
            resolution: 5,
            aggregator: 'sum',
          },
          sum1m: {
            retention: 1440,
            resolution: 60,
            aggregator: 'sum',
          },
          sum1h: {
            retention: 1440,
            resolution: 3600,
            aggregator: 'sum',
          },
        },
      }],
    },
  }, {
    originName: 'task1',
    collectionRef: 'task-task1',
    timeSeriesCollectionSchema: {
      timeSeriesSchemas: [{
        nameGeneratorType: 'addPrefix',
        nameGenerator: 'name_',
        unit: 'bytes',
        metrics: {
          last5s: {
            retention: 1440,
            resolution: 5,
            aggregator: 'last',
          },
          last1m: {
            retention: 1440,
            resolution: 60,
            aggregator: 'last',
          },
          last1h: {
            retention: 1440,
            resolution: 3600,
            aggregator: 'last',
          },
        },
      }, {
        nameGeneratorType: 'exact',
        nameGenerator: 'liters_of_cola',
        unit: 'custom:Liters',
        metrics: {
          sum1w: {
            aggregator: 'sum',
            resolution: 7 * 24 * 60 * 60,
            retention: 520,
          },
        },
      }],
    },
  }]),

  actions: {
    logModelJson() {
      console.log(this.dashboardModel.toJson());
    },
  },
});
