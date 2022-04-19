// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { setProperties } from '@ember/object';
import { dasherize } from '@ember/string';
import { resolve } from 'rsvp';

describe('Integration | Component | workflow visualiser/lane/interblock space', function () {
  setupComponentTest('workflow-visualiser/lane/interblock-space', {
    integration: true,
  });

  beforeEach(function () {
    const actionsFactory = ActionsFactory.create({ ownerSource: this });
    actionsFactory.setGetTaskCreationDataCallback(
      () => resolve({ name: 'Untitled task' })
    );
    this.set('blockSpace', InterblockSpace.create({ actionsFactory }));
  });

  it(
    'has classes "workflow-visualiser-interblock-space", "workflow-visualiser-space" and "workflow-visualiser-element"',
    function () {
      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      expect(this.$().children()).to.have.length(1);
      expect(this.$().children().eq(0))
        .to.have.class('workflow-visualiser-interblock-space')
        .and.to.have.class('workflow-visualiser-space')
        .and.to.have.class('workflow-visualiser-element');
    }
  );

  it('has class "between-parallel-box-space" when "parent" is of type Lane', function () {
    this.set('blockSpace.parent', Lane.create());

    this.render(hbs `{{workflow-visualiser/lane/interblock-space
      elementModel=blockSpace
    }}`);

    expect(this.$('.workflow-visualiser-interblock-space'))
      .to.have.class('between-parallel-box-space');
  });

  it('has class "between-task-space" when "parent" is of type ParallelBox', function () {
    this.set('blockSpace.parent', ParallelBox.create());

    this.render(hbs `{{workflow-visualiser/lane/interblock-space
      elementModel=blockSpace
    }}`);

    expect(this.$('.workflow-visualiser-interblock-space'))
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
    function () {
      setProperties(this.get('blockSpace'), {
        parent,
        elementBefore,
        elementAfter,
      });

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      expect(this.$('.workflow-visualiser-interblock-space')).to.have.class(className);
    });
}

function itAllowsToAddElement(parent, [elementBefore, elementAfter], newElementType, mode) {
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
      this.render(hbs `{{workflow-visualiser/lane/interblock-space
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

function itDoesNotAllowToAddElement(parent, [elementBefore, elementAfter], newElementType, mode) {
  it(
    `does not allow to add element when is in "${mode}" mode and ${siblingsDescription(elementBefore, elementAfter)}`,
    async function () {
      setProperties(this.get('blockSpace'), {
        mode,
        elementBefore,
        elementAfter,
        parent,
      });

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      expect(this.$(`.create-${dasherize(newElementType)}-action-trigger`)).to.not.exist;
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

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        elementModel=blockSpace
      }}`);

      const $arrow = this.$('.arrow');
      if (hasArrow) {
        expect($arrow).to.exist;
      } else {
        expect($arrow).to.not.exist;
      }
    }
  );
}

function siblingsDescription(elementBefore, elementAfter) {
  return `before block is ${elementBefore ? 'not ' : ''}empty and after block is ${elementAfter ? 'not ' : ''}empty`;
}
