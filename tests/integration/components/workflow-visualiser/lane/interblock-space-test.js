import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import sinon from 'sinon';
import { setProperties } from '@ember/object';
import { dasherize } from '@ember/string';
import { resolve } from 'rsvp';

describe('Integration | Component | workflow-visualiser/lane/interblock-space', function () {
  setupRenderingTest();

  beforeEach(function () {
    const actionsFactory = ActionsFactory.create({ ownerSource: this.owner });
    actionsFactory.setGetTaskCreationDataCallback(
      () => resolve({ name: 'Untitled task' })
    );
    this.set('blockSpace', InterblockSpace.create({ actionsFactory }));
  });

  it(
    'has classes "workflow-visualiser-interblock-space", "workflow-visualiser-space" and "workflow-visualiser-element"',
    async function () {
      await render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('workflow-visualiser-interblock-space')
        .and.to.have.class('workflow-visualiser-space')
        .and.to.have.class('workflow-visualiser-element');
    }
  );

  it('has class "between-parallel-box-space" when "parent" is of type Lane', async function () {
    this.set('blockSpace.parent', Lane.create());

    await render(hbs `{{workflow-visualiser/lane/interblock-space
      elementModel=blockSpace
    }}`);

    expect(find('.workflow-visualiser-interblock-space'))
      .to.have.class('between-parallel-box-space');
  });

  it('has class "between-task-space" when "parent" is of type ParallelBox', async function () {
    this.set('blockSpace.parent', ParallelBox.create());

    await render(hbs `{{workflow-visualiser/lane/interblock-space
      elementModel=blockSpace
    }}`);

    expect(find('.workflow-visualiser-interblock-space'))
      .to.have.class('between-task-space');
  });

  context('between parallel boxes', function () {
    [{
      siblings: [null, ParallelBox.create()],
      type: 'start',
      hasArrowInEdition: true,
      hasArrowInView: false,
    }, {
      siblings: [ParallelBox.create(), null],
      type: 'end',
      hasArrowInEdition: true,
      hasArrowInView: false,
    }, {
      siblings: [ParallelBox.create(), ParallelBox.create()],
      type: 'between',
      hasArrowInEdition: true,
      hasArrowInView: true,
    }, {
      siblings: [null, null],
      type: 'empty',
      hasArrowInEdition: false,
      hasArrowInView: false,
    }].forEach(({ siblings, type, hasArrowInEdition, hasArrowInView }) => {
      itIsOfType(type, ParallelBox.create(), siblings);
      itAllowsToAddElement(Lane.create(), siblings, 'parallelBox', 'edit');
      itDoesNotAllowToAddElement(Lane.create(), siblings, 'parallelBox', 'view');
      itHasArrow(hasArrowInEdition, Lane.create(), siblings, 'edit');
      itHasArrow(hasArrowInView, Lane.create(), siblings, 'view');
    });
  });

  context('between tasks', function () {
    [{
      siblings: [null, Task.create()],
      type: 'start',
      allowsToAdd: false,
    }, {
      siblings: [Task.create(), null],
      type: 'end',
      allowsToAdd: true,
    }, {
      siblings: [Task.create(), Task.create()],
      type: 'between',
      allowsToAdd: false,
    }, {
      siblings: [null, null],
      type: 'empty',
      allowsToAdd: true,
    }].forEach(({ siblings, type, allowsToAdd }) => {
      itIsOfType(type, ParallelBox.create(), siblings);
      if (allowsToAdd) {
        itAllowsToAddElement(ParallelBox.create(), siblings, 'task', 'edit');
      } else {
        itDoesNotAllowToAddElement(ParallelBox.create(), siblings, 'task', 'edit');
      }
      itDoesNotAllowToAddElement(ParallelBox.create(), siblings, 'task', 'view');
      itHasArrow(false, ParallelBox.create(), siblings, 'edit');
      itHasArrow(false, ParallelBox.create(), siblings, 'view');
    });
  });
});

function itIsOfType(type, parent, [elementBefore, elementAfter]) {
  const className = `space-position-${type}`;
  it(`has class "${className}" when ${siblingsDescription(elementBefore, elementAfter)}`,
    async function () {
      setProperties(this.get('blockSpace'), {
        parent,
        elementBefore,
        elementAfter,
      });

      await render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      expect(find('.workflow-visualiser-interblock-space')).to.have.class(className);
    });
}

function itAllowsToAddElement(
  parent,
  [elementBefore, elementAfter],
  newElementType,
  mode
) {
  it(
    `allows to add element when is in "${mode}" mode and ${siblingsDescription(elementBefore, elementAfter)}`,
    async function () {
      const onAddElement = sinon.stub().resolves();
      setProperties(this.get('blockSpace'), {
        mode,
        elementBefore,
        elementAfter,
        parent,
        onAddElement,
      });
      await render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      await click(`.create-${dasherize(newElementType)}-action-trigger`);

      const newElementMatcher = {
        name: newElementType === 'task' ? 'Untitled task' : 'Parallel box',
      };
      expect(onAddElement).to.be.calledOnce
        .and.to.be.calledWith(parent, elementBefore, sinon.match(newElementMatcher));
    }
  );
}

function itDoesNotAllowToAddElement(
  parent,
  [elementBefore, elementAfter],
  newElementType,
  mode
) {
  it(
    `does not allow to add element when is in "${mode}" mode and ${siblingsDescription(elementBefore, elementAfter)}`,
    async function () {
      setProperties(this.get('blockSpace'), {
        mode,
        elementBefore,
        elementAfter,
        parent,
      });

      await render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      expect(find(`.create-${dasherize(newElementType)}-action-trigger`)).to.not.exist;
    }
  );
}

function itHasArrow(hasArrow, parent, [elementBefore, elementAfter], mode) {
  it(
    `${hasArrow ? 'renders' : 'does not render any'} arrow when is in "${mode}" mode and ${siblingsDescription(elementBefore, elementAfter)}`,
    async function () {
      setProperties(this.get('blockSpace'), {
        mode,
        elementBefore,
        elementAfter,
        parent,
      });

      await render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      const arrow = find('.arrow');
      if (hasArrow) {
        expect(arrow).to.exist;
      } else {
        expect(arrow).to.not.exist;
      }
    }
  );
}

function siblingsDescription(elementBefore, elementAfter) {
  return `before block is ${elementBefore ? 'not ' : ''}empty and after block is ${elementAfter ? 'not ' : ''}empty`;
}
