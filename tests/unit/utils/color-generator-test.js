import { expect } from 'chai';
import { describe, it } from 'mocha';
import ColorGenerator from 'onedata-gui-common/utils/color-generator';

describe('Unit | Utility | color generator', function () {
  it('generates an array of unique colors', function () {
    const generator = createGenerator();

    const colors = generator.generateColorsArray(100);

    expect(colors).to.have.length(100);
    expect(new Set(colors).size).to.equal(100);
    colors.forEach((color) => expectToBeColor(color));
  });

  it('generates color arrays with the same first elements', function () {
    const generator = createGenerator();

    const colors1 = generator.generateColorsArray(100);
    const colors2 = generator.generateColorsArray(150);

    expect(colors2.slice(0, 100)).to.deep.equal(colors1);
  });

  it('generates unique colors for keys', function () {
    const generator = createGenerator();

    const colors = [
      generator.generateColorForKey('a'),
      generator.generateColorForKey('b'),
      generator.generateColorForKey('c'),
    ];

    expect(new Set(colors).size).to.equal(3);
    colors.forEach((color) => expectToBeColor(color));
  });

  it('returns an already generated color matching to a key', function () {
    const generator = createGenerator();

    const color1 = generator.generateColorForKey('a');
    const color2 = generator.generateColorForKey('a');

    expect(color1).to.equal(color2);
  });
});

function createGenerator() {
  return new ColorGenerator();
}

const hexColorRegexp = /^#[a-f0-9]{6}$/i;

function expectToBeColor(color) {
  expect(color).to.match(hexColorRegexp);
}
