import { expect } from 'chai';
import { describe, it } from 'mocha';
import staticBuilder from 'onedata-gui-common/utils/one-time-series-chart/series-group-builders/static';
import sinon from 'sinon';

describe('Unit | Utility | one-time-series-chart/series-group-builders/static', function () {
  it('generates single series group', async function () {
    const fakeSeries = { name: '123', stack: false };
    const context = {
      evaluateSeriesGroup: sinon.spy(() => fakeSeries),
    };
    const args = {
      seriesGroupTemplate: { name: '123' },
    };

    expect(await staticBuilder(context, args)).to.deep.equal([fakeSeries]);
    expect(context.evaluateSeriesGroup).to.be.calledOnce.and.to.be.calledWith(
      context,
      args.seriesGroupTemplate
    );
  });

  it('generates no series group when arguments are not complete', async function () {
    const fakeSeries = { name: '123', stack: false };
    const context = {
      evaluateSeriesGroup: sinon.spy(() => fakeSeries),
    };
    const args1 = {};
    const args2 = null;

    expect(await staticBuilder(context, args1)).to.deep.equal([]);
    expect(await staticBuilder(context, args2)).to.deep.equal([]);
    expect(context.evaluateSeriesGroup).to.be.not.called;
  });
});
