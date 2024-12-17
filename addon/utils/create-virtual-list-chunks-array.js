// FIXME: jsdoc

import VirtualListFetcher from 'onedata-gui-common/utils/virtual-list-fetcher';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';

// FIXME: warto napisać testy dla tego kosntruktu

/**
 * @param {GraphListModel} listModel
 * @param {Object} chunksArrayOptions Properties passed to ReplacinChunksArray create.
 * @returns {ReplacingChunksArray}
 */
export default function createVirtualListChunksArray(listModel, chunksArrayOptions) {
  const virtualListFetcher = VirtualListFetcher.create({
    listModel,
  });
  const chunksArray = ReplacingChunksArray.create({
    fetch: (index, limit, offset) => {
      return virtualListFetcher.fetch(index, limit, offset);
    },
    startIndex: 0,
    endIndex: 50,
    indexMargin: 10,
    ...chunksArrayOptions,
  });
  // FIXME: mając tą funkcję konstruującą, można zrobić jeszcze większą abstrakcję: wydzielić observer z VLF
  // wtedy będzie bardziej MVC (M - virtual list fetcher; V - chunks array; C - reloader)
  // to może zwracać ponadto obiekt, który da się łatwo destroyować zamiast pojedynczego chunks array
  virtualListFetcher.onReloadNeeded = () => {
    chunksArray.scheduleReload();
  };
  return chunksArray;
}
