import { expect } from 'chai';
import { describe, it } from 'mocha';
import { anchorizeText } from 'onedata-gui-common/utils/anchorize-text';

describe('Unit | Utility | anchorize-text', function () {
  it('creates HTML with anchor elements using other HTML string', function () {
    const result = anchorizeText(
      'Example:<br>https://www.wikidata.org/wiki/Q4093<br><br>http://sws.geonames.org/2950159<br>https://vocab.getty.edu/tgn/7006663<p>When it is a Literal, use a coordinate in this format:<br>48.833611111, 2.375833333'
    );
    const expected =
      'Example:<br><a href="https://www.wikidata.org/wiki/Q4093">https://www.wikidata.org/wiki/Q4093</a><br><br><a href="http://sws.geonames.org/2950159">http://sws.geonames.org/2950159</a><br><a href="https://vocab.getty.edu/tgn/7006663">https://vocab.getty.edu/tgn/7006663</a><p>When it is a Literal, use a coordinate in this format:<br>48.833611111, 2.375833333';
    expect(result).to.equal(expected);
  });
});
