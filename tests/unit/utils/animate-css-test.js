import { expect } from 'chai';
import { describe, it } from 'mocha';
import animateCss from 'onedata-gui-common/utils/animate-css';

describe('Unit | Utility | animate css', function () {
  it('adds and removes animation classes', function () {
    const element = document.createElement('div');
    const div = document.body.appendChild(element);

    const animatePromise = animateCss(div, 'pulse-mint', 'fast');
    expect(div).to.have.class('animated');
    expect(div).to.have.class('pulse-mint');
    return animatePromise.then(() => {
      expect(div).to.not.have.class('animated');
      expect(div).to.not.have.class('pulse-mint');
    });
  });
});
