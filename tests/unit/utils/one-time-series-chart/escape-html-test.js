import { expect } from 'chai';
import { describe, it } from 'mocha';
import escapeHtml from 'onedata-gui-common/utils/one-time-series-chart/escape-html';

describe('Unit | Utility | one time series chart/escape html', function () {
  it('returns the same string, when argument does not contain any HTML', function () {
    const input = 'some text';
    const output = escapeHtml(input);
    expect(output).to.equal(input);
  });

  it('returns the same string, when argument contains allowed HTML tags', function () {
    const input = '<br>' + [
      'b',
      'em',
      'i',
      'p',
      'strong',
    ].map((tagName) => `<${tagName}>text</${tagName}>`).join('');
    const output = escapeHtml(input);
    expect(output).to.equal(input);
  });

  it('returns escaped string, when argument contains forbidden HTML tags', function () {
    const input = '<a>text</a><div>text</div><script>text</script>';
    const output = escapeHtml(input);
    expect(output).to.equal('texttext');
  });

  it('returns escaped string, when argument contains HTML attributes', function () {
    const input = '<p class="a" style="color: red">text</p>';
    const output = escapeHtml(input);
    expect(output).to.equal('<p>text</p>');
  });
});
