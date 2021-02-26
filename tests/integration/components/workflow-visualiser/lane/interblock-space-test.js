import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import LaneElement from 'onedata-gui-common/utils/workflow-visualiser/lane/lane-element';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | workflow visualiser/lane/interblock space', function () {
  setupComponentTest('workflow-visualiser/lane/interblock-space', {
    integration: true,
  });

  it('has classes "workflow-visualiser-interblock-space" and "workflow-visualiser-lane-element"', function () {
    this.render(hbs `{{workflow-visualiser/lane/interblock-space}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0))
      .to.have.class('workflow-visualiser-interblock-space')
      .and.to.have.class('workflow-visualiser-lane-element');
  });

  ['first', 'second'].forEach(blockPrefix => {
    const blockName = `${blockPrefix}Block`;
    const htmlAttrForBlock = `data-${blockPrefix}-block-id`;

    it(`has not specified "${htmlAttrForBlock}" attribute when "${blockName}" is undefined`, function () {
      this.set('blockSpace', InterblockSpace.create({
        [blockName]: undefined,
      }));

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        laneElement=blockSpace
      }}`);

      expect(this.$('.workflow-visualiser-interblock-space'))
        .to.not.have.attr(htmlAttrForBlock);
    });

    it(`has specified "${htmlAttrForBlock}" attribute when "${blockName}" is specified`, function () {
      const blockId = '1234';
      this.set('blockSpace', InterblockSpace.create({
        [blockName]: LaneElement.create({
          id: blockId,
        }),
      }));

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        laneElement=blockSpace
      }}`);

      expect(this.$('.workflow-visualiser-interblock-space'))
        .to.have.attr(htmlAttrForBlock, blockId);
    });
  });

  it('has class "between-parallel-blocks-space" when "parent" is of type Lane', function () {
    this.set('blockSpace', InterblockSpace.create({
      parent: Lane.create(),
    }));

    this.render(hbs `{{workflow-visualiser/lane/interblock-space
      laneElement=blockSpace
    }}`);

    expect(this.$('.workflow-visualiser-interblock-space'))
      .to.have.class('between-parallel-blocks-space');
  });

  it('has class "between-tasks-space" when "parent" is of type ParallelBlock', function () {
    this.set('blockSpace', InterblockSpace.create({
      parent: ParallelBlock.create(),
    }));

    this.render(hbs `{{workflow-visualiser/lane/interblock-space
      laneElement=blockSpace
    }}`);

    expect(this.$('.workflow-visualiser-interblock-space'))
      .to.have.class('between-tasks-space');
  });

  context('between parallel blocks', function () {
    [{
      siblings: [null, ParallelBlock.create()],
      type: 'start',
      hasArrowInEdition: true,
      hasArrowInView: false,
    }, {
      siblings: [ParallelBlock.create(), null],
      type: 'end',
      hasArrowInEdition: true,
      hasArrowInView: false,
    }, {
      siblings: [ParallelBlock.create(), ParallelBlock.create()],
      type: 'between',
      hasArrowInEdition: true,
      hasArrowInView: true,
    }, {
      siblings: [null, null],
      type: 'empty',
      hasArrowInEdition: false,
      hasArrowInView: false,
    }].forEach(({ siblings, type, hasArrowInEdition, hasArrowInView }) => {
      itIsOfType(type, ParallelBlock.create(), siblings);
      itAllowsToAddElement(Lane.create(), siblings, 'edit');
      itDoesNotAllowToAddElement(Lane.create(), siblings, 'view');
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
      itIsOfType(type, ParallelBlock.create(), siblings);
      if (allowsToAdd) {
        itAllowsToAddElement(ParallelBlock.create(), siblings, 'edit');
      } else {
        itDoesNotAllowToAddElement(ParallelBlock.create(), siblings, 'edit');
      }
      itDoesNotAllowToAddElement(ParallelBlock.create(), siblings, 'view');
      itHasArrow(false, ParallelBlock.create(), siblings, 'edit');
      itHasArrow(false, ParallelBlock.create(), siblings, 'view');
    });
  });
});

function itIsOfType(type, parent, [firstBlock, secondBlock]) {
  const className = `space-position-${type}`;
  it(`has class "${className}" when first block is ${firstBlock ? 'not ' : ''}empty and second block is ${secondBlock ? 'not ' : ''}empty`,
    function () {
      this.set('blockSpace', InterblockSpace.create({
        parent,
        firstBlock,
        secondBlock,
      }));

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
      laneElement=blockSpace
    }}`);

      expect(this.$('.workflow-visualiser-interblock-space')).to.have.class(className);
    });
}

function itAllowsToAddElement(parent, [firstBlock, secondBlock], mode) {
  it(
    `allows to add element when is in "${mode}" mode and ${siblingsDescription(firstBlock, secondBlock)}`,
    async function () {
      const onAddBlock = sinon.spy();
      this.set('blockSpace', InterblockSpace.create({
        mode,
        firstBlock,
        secondBlock,
        parent,
        onAddBlock,
      }));
      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        laneElement=blockSpace
      }}`);

      await click('.add-block-action-trigger');

      expect(onAddBlock).to.be.calledOnce.and.to.be.calledWith(parent, firstBlock);
    }
  );
}

function itDoesNotAllowToAddElement(parent, [firstBlock, secondBlock], mode) {
  it(
    `does not allow to add element when is in "${mode}" mode and ${siblingsDescription(firstBlock, secondBlock)}`,
    async function () {
      this.set('blockSpace', InterblockSpace.create({
        mode,
        firstBlock,
        secondBlock,
        parent,
      }));

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        laneElement=blockSpace
      }}`);

      expect(this.$('.add-block-action-trigger')).to.not.exist;
    }
  );
}

function itHasArrow(hasArrow, parent, [firstBlock, secondBlock], mode) {
  it(
    `${hasArrow ? 'renders' : 'does not render any'} arrow when is in "${mode}" mode and ${siblingsDescription(firstBlock, secondBlock)}`,
    async function () {
      this.set('blockSpace', InterblockSpace.create({
        mode,
        firstBlock,
        secondBlock,
        parent,
      }));

      this.render(hbs `{{workflow-visualiser/lane/interblock-space
        laneElement=blockSpace
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

function siblingsDescription(firstBlock, secondBlock) {
  return `first block is ${firstBlock ? 'not ' : ''}empty and second block is ${secondBlock ? 'not ' : ''}empty`;
}
