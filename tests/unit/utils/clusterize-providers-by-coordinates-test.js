import { expect } from 'chai';
import { describe, it } from 'mocha';
import clusterizeProvidersByCoordinates from 'onedata-gui-common/utils/clusterize-providers-by-coordinates';

describe('Unit | Utility | clusterize-providers-by-coordinates', function () {
  it('clusterizes providers', function () {
    const providers = [
      { latitude: -4, longitude: 3.4 },
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
      { latitude: 20, longitude: 30 },
    ];

    const result = clusterizeProvidersByCoordinates(providers, 10, 10);
    expect(result).to.have.lengthOf(3);
    [
      { len: 2, prov: [providers[0], providers[1]], lat: -2, long: 1.7 },
      { len: 2, prov: [providers[2], providers[3]], lat: 2, long: 3 },
      { len: 1, prov: [providers[4]], lat: 20, long: 30 },
    ].forEach((expected, i) => {
      expect(result[i].providers).to.have.lengthOf(expected.len);
      expected.prov.forEach(provider =>
        expect(result[i].providers).to.include(provider)
      );
      expect(result[i].latitude).to.equal(expected.lat);
      expect(result[i].longitude).to.equal(expected.long);
    });
  });
});
