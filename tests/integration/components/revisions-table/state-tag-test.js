import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const componentClass = 'revisions-table-state-tag';

describe('Integration | Component | revisions-table/state-tag', function () {
  setupRenderingTest();

  it(`has class "${componentClass}"`, async function () {
    await renderComponent();

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class(componentClass);
  });

  itShowsState({
    state: 'draft',
    label: 'Draft',
    style: 'info',
  });
  itShowsState({
    state: 'stable',
    label: 'Stable',
    style: 'success',
  });
  itShowsState({
    state: 'deprecated',
    label: 'Deprecated',
    style: 'default',
  });
});

async function renderComponent() {
  await render(hbs `{{revisions-table/state-tag state=state}}`);
}

function itShowsState({ state, label, style }) {
  it(`shows state ${state} as "${label}" and styled as "${style}"`, async function () {
    this.set('state', state);

    await renderComponent();

    const component = find(`.${componentClass}`);
    expect(component).to.have.class(`state-${state}`).and
      .to.have.class(`label-${style}`);
    expect(component.textContent.trim()).to.equal(label);
  });
}
