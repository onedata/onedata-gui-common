import { expect } from 'chai';
import { describe, it } from 'mocha';
import clusterizeProvidersByCoordinates from 'onedata-gui-common/utils/clusterize-providers-by-coordinates';

describe('Unit | Utility | clusterize providers by coordinates', function () {
  it('clusterizes providers', function () {
    const providers = [
      { latitude: -4, longitude: 3.4 },
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 10 },
      { latitude: 20, longitude: 30 },
    ];

    const result = clusterizeProvidersByCoordinates(providers, 5, 5);
    expect(result.length).to.equal(4);
    expect(result[0].providers.length).to.equal(1);
    expect(result[1].providers.length).to.equal(2);
    expect(result[2].providers.length).to.equal(1);
    expect(result[3].providers.length).to.equal(1);
    expect(result[0].latitude).to.equal(-4);
    expect(result[0].longitude).to.equal(3.4);
    expect(result[1].latitude).to.equal(2.5);
    expect(result[1].longitude).to.equal(2.5);
    expect(result[2].latitude).to.equal(3);
    expect(result[2].longitude).to.equal(10);
    expect(result[3].latitude).to.equal(20);
    expect(result[3].longitude).to.equal(30);
    expect(result[0].providers[0]).to.equal(providers[0]);
    expect(result[1].providers[0]).to.equal(providers[1]);
    expect(result[1].providers[1]).to.equal(providers[2]);
    expect(result[2].providers[0]).to.equal(providers[3]);
    expect(result[3].providers[0]).to.equal(providers[4]);
  });
});
