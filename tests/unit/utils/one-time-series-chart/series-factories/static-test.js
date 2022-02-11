import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import staticFactory from 'onedata-gui-common/utils/one-time-series-chart/series-factories/static';

describe('Unit | Utility | one time series chart/series factories/static', function () {
  it('generates single series', async function () {
    const fakeSeries = { name: '123', data: [] };
    const context = {
      evaluateSeries: sinon.spy(async () => fakeSeries),
    };
    const args = {
      seriesTemplate: { name: '123' },
    };

    expect(await staticFactory(context, args)).to.deep.equal([fakeSeries]);
    expect(context.evaluateSeries).to.be.calledOnce.and.to.be.calledWith(
      context,
      args.seriesTemplate
    );
  });

  it('generates no series when arguments are not complete', async function () {
    const fakeSeries = { name: '123', data: [] };
    const context = {
      evaluateSeries: sinon.spy(async () => fakeSeries),
    };
    const args1 = {};
    const args2 = null;

    expect(await staticFactory(context, args1)).to.deep.equal([]);
    expect(await staticFactory(context, args2)).to.deep.equal([]);
    expect(context.evaluateSeries).to.be.not.called;
  });
});
