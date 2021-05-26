import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateId from 'onedata-gui-common/utils/workflow-visualiser/generate-id';

describe('Unit | Utility | workflow visualiser/generate id', function () {
  it('generates 38-characters long string', function () {
    const result = generateId();
    expect(result).to.be.a('string').and.to.have.length(38);
  });

  it('generates unique strings', function () {
    const results = new Set();
    for (let i = 0; i < 1000; i++) {
      results.add(generateId());
    }

    expect(results.size).to.equal(1000);
    console.log(results);
  });
});
