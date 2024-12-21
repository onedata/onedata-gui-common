// FIXME: jsdoc

import VirtualListChunksArray from './virtual-list-chunks-array';

// FIXME: warto napisać testy dla tego kosntruktu

/**
 * @param {GraphListModel} listModel
 * @param {Object} chunksArrayOptions Properties passed to ReplacinChunksArray create.
 * @returns {ReplacingChunksArray}
 */
export default function createVirtualListChunksArray(listModel, chunksArrayOptions) {
  return new VirtualListChunksArray(listModel, chunksArrayOptions);
}
