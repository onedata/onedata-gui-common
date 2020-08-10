import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import ReplacingChunksArray, { emptyItem } from 'onedata-gui-common/utils/replacing-chunks-array';
import _ from 'lodash';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { Promise, resolve } from 'rsvp';
import { get } from '@ember/object';

const defaultMockArraySize = 1000;

class Record {
  constructor(index) {
    this.index = index;
    this.id = index;
  }
}

function recordRange(start, end) {
  return _.range(start, end).map(i => new Record(i));
}

class MockArray {
  constructor() {
    this.array = recordRange(0, defaultMockArraySize);
  }
  fetch(
    fromIndex,
    size = Number.MAX_SAFE_INTEGER,
    offset = 0
  ) {
    if (fromIndex == null) {
      fromIndex = Number.MIN_SAFE_INTEGER;
    }
    let startIndex = 0;
    for (let i = 0; i < this.array.length; ++i) {
      startIndex = i;
      if (this.array[i].index >= fromIndex) {
        break;
      }
    }
    const startOffset = Math.max(
      0,
      Math.min(startIndex + offset, this.array.length)
    );
    const endOffset = Math.min(startOffset + size, this.array.length);
    return resolve(this.array.slice(startOffset, endOffset));
  }
}

class MockFullArray {
  constructor(size = 1000) {
    this.size = size;
    this.array = recordRange(0, size);
  }
  /**
   * For test purposes, this array ignores completely input params and always returns
   * all the array.
   */
  fetch() {
    return Promise.resolve([...this.array]);
  }
}

function removeFromArray(array, pos) {
  return [...array.slice(0, pos), ...array.slice(pos + 1, array.length)];
}

function addToArray(array, pos, ...items) {
  return [...array.slice(0, pos), ...items, ...array.slice(pos, array.length)];
}

function mapIndex(array) {
  return array.toArray().map(i => i && get(i, 'index'));
}

function inspect(rca) {
  return `_start: ${get(rca, '_start')}; _end: ${get(rca, '_end')}; ` +
    `array: ${mapIndex(rca)}; ` +
    `source: ${mapIndex(get(rca, 'sourceArray'))}`;
}

const gteMatcher = (compareValue) => {
  return sinon.match(
    value => value >= compareValue,
    `greater or equal ${compareValue}`
  );
};

describe('Unit | Utility | replacing chunks array', function () {
  beforeEach(function () {
    this.mockArray = new MockArray();
    this.fetch = MockArray.prototype.fetch.bind(this.mockArray);
  });

  it('exposes fragment of internal array and fetches new chunks', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 10;
    const initialEndIndex = 20;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: initialEndIndex,
      chunkSize,
    });
    return get(array, 'initialLoad').then(() => {
      // start is zero, so only fetchNext will be invoked
      expect(fetchSpy, 'initial fetch').to.be.calledTwice;
      expect(fetchSpy).to.be.calledWith(null, 20, 0);
      expect(fetchSpy).to.be.calledWith(19, chunkSize, 1);
      fetchSpy.reset();
      expect(get(array, 'sourceArray.length'), 'source length after init')
        .to.equal(initialEndIndex + chunkSize);
      expect(get(array, 'length'), 'length after init').to.equal(initialEndIndex);
      expect(array.toArray(), 'content after init: ' + array.mapBy('index'))
        .to.deep.equal(recordRange(0, initialEndIndex));
      return wait();
    }).then(() => {
      array.setProperties({
        startIndex: 15,
        endIndex: 25,
      });
      return wait();
    }).then(() => {
      expect(fetchSpy, 'fetch after range change').to.be.calledOnce;
      expect(get(array, 'length'), 'length after range change').to.equal(10);
      expect(array.toArray(), 'content after range change')
        .to.deep.equal(recordRange(15, 25));
    });
  });

  it('reloads currently viewed fragment of array at beginning', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 10,
    });
    return wait()
      .then(() => {
        fetchSpy.reset();
        array.reload();
        return wait();
      })
      .then(() => {
        expect(fetchSpy, 'fetch after reload').to.be.calledOnce;
        expect(fetchSpy, 'fetch current records starts from null')
          .to.be.calledWith(null, 10, 0);
        expect(array.toArray(), 'content after reload')
          .to.deep.equal(recordRange(0, 10));
      });
  });

  it('performs fetch as large as needed to load array content', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
    });
    return wait()
      .then(() => {
        expect(array.toArray(), 'content before reload')
          .to.deep.equal(recordRange(0, 20));
        array.setProperties({
          startIndex: 15,
          endIndex: 45,
        });
        return wait();
      })
      .then(() => {
        expect(fetchSpy, 'fetch records needed to fill start to end')
          .to.be.calledWith(gteMatcher(19), gteMatcher(25), 1);
        expect(get(array, '_start')).to.equal(15);
        expect(get(array, '_end')).to.equal(45);
        expect(array.toArray(), 'content after reload')
          .to.deep.equal(recordRange(15, 45));
      });
  });

  it('reloads array in the middle',
    function () {
      const fetchSpy = sinon.spy(this.fetch);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 100,
      });
      return wait()
        .then(() => {
          fetchSpy.reset();
          array.setProperties({
            startIndex: 30,
            endIndex: 40,
          });
          array.reload();
          return wait();
        })
        .then(() => {
          expect(fetchSpy).to.be.calledOnce;
          expect(fetchSpy).to.be.calledWith(30, 10, 0);
        });
    }
  );

  it('immediately returns new firstObject if changing startIndex and endIndex',
    function () {
      const fullArray = _.times(1000, i => new Record(i));

      function getData(index, limit = 10000000, offset = 0) {
        let arrIndex = _.findIndex(fullArray, i => i.index === index);
        if (arrIndex === -1) {
          arrIndex = 0;
        }
        return resolve(
          fullArray.slice(arrIndex + offset, arrIndex + offset + limit)
        );
      }

      const array = ReplacingChunksArray.create({
        fetch: getData,
        startIndex: 0,
        endIndex: 30,
      });
      return get(array, 'initialLoad')
        .then(() => {
          expect(array.get('firstObject.index')).to.equal(0);

          array.setProperties({
            startIndex: 7,
            endIndex: 17,
          });
          return wait();
        })
        .then(() => {
          expect(array.toArray(), 'content after index change')
            .to.deep.equal(recordRange(7, 17));
          expect(array.objectAt(0).index, 'after: objectAt 0')
            .to.equal(7);
          expect(array.get('firstObject.index'), 'after: firstObject')
            .to.equal(7);
        });
    }
  );

  it('has the same lastObject with toArray after fetch',
    function () {
      const fetchSpy = sinon.spy(this.fetch);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10,
      });
      return get(array, 'initialLoad').then(() => {
        expect(array.get('lastObject.index'), 'last object before')
          .to.equal(array.toArray().get('lastObject.index'));

        array.setProperties({
          startIndex: 7,
          endIndex: 17,
        });
        return wait()
          .then(() => {
            expect(array.get('lastObject.index'), 'last object after')
              .to.equal(array.toArray().get('lastObject.index'));
          });
      });
    }
  );

  it('invokes fetch when going forth and back',
    function () {
      const fetchSpy = sinon.spy(this.fetch);
      const chunkSize = 30;
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 50,
        indexMargin: 10,
        chunkSize,
      });
      return wait()
        .then(() => {
          expect(fetchSpy).to.have.been.calledWith(null, 60, 0);
          array.setProperties({
            startIndex: 20,
            endIndex: 60,
          });
          return wait();
        })
        .then(() => {
          expect(fetchSpy).to.have.been.calledWith(
            59, // index of last element
            chunkSize,
            1
          );
          expect(array.toArray(), 'array content after index change to forth')
            .to.deep.equal(recordRange(10, 70));
          // reload causes 0..10 items to be emptied
          array.reload();
          return wait();
        })
        .then(() => {
          array.setProperties({
            startIndex: 0,
            endIndex: 50,
          });
          return wait();
        })
        .then(() => {
          expect(
              array.toArray(),
              `array index change back: ${array.toArray().mapBy('index').join(', ')}`
            )
            .to.deep.equal(recordRange(0, 60));
        });
    }
  );

  it('invalidates previous items when reloading in the middle',
    function () {
      const fetchSpy = sinon.spy(this.fetch);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 50,
        indexMargin: 10,
        chunkSize: 10,
      });
      return wait()
        .then(() => {
          array.setProperties({
            startIndex: 10,
            endIndex: 60,
          });
          return wait();
        })
        .then(() => {
          array.setProperties({
            startIndex: 20,
            endIndex: 70,
          });
          return wait();
        })
        .then(() => {
          array.reload();
          return wait();
        })
        .then(() => {
          expect(get(array, 'emptyIndex'), 'emptyIndex forth').to.equal(9);
          expect(
            get(array, 'sourceArray').toArray().slice(0, 10),
            'invalidated items at beginning'
          ).to.deep.equal(_.times(10, _.constant(emptyItem)));
          expect(array.toArray(), 'proper content').to.deep.equal(
            recordRange(10, 80)
          );
          array.setProperties({
            startIndex: 0,
            endIndex: 50,
          });
          return wait();
        })
        .then(() => {
          expect(get(array, 'emptyIndex'), 'emptyIndex back').to.equal(-1);
          expect(array.toArray()).to.deep.equal(recordRange(0, 60));
        });
    }
  );

  it('loads start part of the list after reload in the middle', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    return wait()
      .then(() => {
        array.setProperties({
          startIndex: 10,
          endIndex: 60,
        });
        return wait();
      })
      .then(() => {
        array.setProperties({
          startIndex: 20,
          endIndex: 70,
        });
        return wait();
      })
      .then(() => {
        this.mockArray.array = removeFromArray(this.mockArray.array, 70);
        array.reload();
        expect(array.toArray()).to.deep.equal(
          removeFromArray(recordRange(10, 80), 70)
        );
        return wait();
      })
      .then(() => {
        array.setProperties({
          startIndex: 0,
          endIndex: 50,
        });
        return wait();
      })
      .then(() => {
        expect(array.toArray()).to.deep.equal(recordRange(0, 60));
      });
  });

  it('loads new data if range is set from 0 after new data is added', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    const frontRecord1 = new Record(-2);
    const frontRecord2 = new Record(-1);
    return wait()
      .then(() => {
        array.setProperties({
          startIndex: 10,
          endIndex: 60,
        });
        return wait();
      })
      .then(() => {
        array.setProperties({
          startIndex: 20,
          endIndex: 70,
        });
        return wait();
      })
      .then(() => {
        this.mockArray.array = addToArray(
          this.mockArray.array,
          0,
          frontRecord1,
          frontRecord2
        );
        array.reload();
        return wait();
      })
      .then(() => {
        array.setProperties({
          startIndex: 0,
          endIndex: 50,
        });
        return wait();
      })
      .then(() => {
        const actualArray = array.toArray();
        const expectedArray = recordRange(0, 70);
        expect(actualArray).to.deep.equal(expectedArray);
        expect(get(array, '_start')).to.equal(2);
        expect(get(array, '_end')).to.equal(72);
        expect(get(array, 'sourceArray.0.index')).to.equal(-2);
        expect(get(array, 'sourceArray.1.index')).to.equal(-1);
      });
  });

  it('notifies about fetchPrev start and resolve', function () {
    const fetchPrevStartedHandler = sinon.spy();
    const fetchPrevResolvedHandler = sinon.spy();
    const fetchSpy = sinon.spy(this.fetch);

    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    array.on('fetchPrevStarted', fetchPrevStartedHandler);
    array.on('fetchPrevResolved', fetchPrevResolvedHandler);

    return wait()
      .then(() => {
        array.setProperties({
          startIndex: 10,
          endIndex: 60,
        });
        return wait();
      })
      .then(() => {
        array.setProperties({
          startIndex: 20,
          endIndex: 70,
        });
        return wait();
      })
      .then(() => {
        array.reload();
        return wait();
      })
      .then(() => {
        array.setProperties({
          startIndex: 0,
          endIndex: 50,
        });
        expect(fetchPrevStartedHandler).to.be.calledOnce;
        return wait();
      })
      .then(() => {
        expect(fetchPrevResolvedHandler).to.be.calledOnce;
      });
  });

  it('fills sourceArray with more data than expected if fetched more and uses it later',
    function () {
      const arraySize = 1000;
      const mockFullArray = new MockFullArray(arraySize);
      const fetchFullArray = MockFullArray.prototype.fetch.bind(mockFullArray);
      const fetchSpy = sinon.spy(fetchFullArray);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 20,
        indexMargin: 0,
      });
      return wait()
        .then(() => {
          expect(fetchSpy).to.be.calledOnce;
          expect(array.toArray(), 'first load contents')
            .to.deep.equal(recordRange(0, 20));
          expect(get(array, 'sourceArray')).to.have.lengthOf(arraySize);
          array.setProperties({
            startIndex: 20,
            endIndex: 60,
          });
          return wait();
        })
        .then(() => {
          expect(fetchSpy).to.be.calledOnce;
          expect(array.toArray()).to.deep.equal(recordRange(20, 60));
          expect(get(array, 'sourceArray')).to.have.lengthOf(arraySize);
        });
    }
  );

  it('injects self reference into fetch method',
    function () {
      let compareArrayInstancesResult = undefined;
      let array;
      this.fetch = (a, b, c, arrayInstance) => {
        compareArrayInstancesResult = array === arrayInstance;
        return resolve([]);
      };
      array = ReplacingChunksArray.create({
        fetch: this.fetch.bind(this),
        startIndex: 0,
        endIndex: 50,
        indexMargin: 10,
      });

      array.reload();

      return wait()
        .then(() => {
          expect(compareArrayInstancesResult).to.equal(true);
        });
    }
  );

  it('uses offset if there are index duplicates', function () {
    const duplicatedIndex = 15;
    const indexMargin = 1;
    const marray = this.mockArray.array;
    const duplicates = [
      { index: duplicatedIndex, id: duplicatedIndex + 'a' },
      { index: duplicatedIndex, id: duplicatedIndex + 'b' },
      { index: duplicatedIndex, id: duplicatedIndex + 'c' },
    ];
    this.mockArray.array = [
      ...marray.slice(0, duplicatedIndex),
      ...duplicates,
      ...marray.slice(duplicatedIndex + 1, marray.length),
    ];
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      // adding 3 because need to reach 3rd duplicate (it should be on the end)
      endIndex: duplicatedIndex + 3 - indexMargin,
      indexMargin: indexMargin,
    });

    return wait()
      .then(() => {
        array.setProperties({
          startIndex: duplicatedIndex - 5,
          endIndex: duplicatedIndex + 15,
        });
        return wait();
      })
      .then(() => {
        expect(fetchSpy).to.be.calledWith(duplicatedIndex);
        const expectedArray = [
          ...recordRange(
            duplicatedIndex - 5 - indexMargin,
            duplicatedIndex
          ),
          ...duplicates,
          ...recordRange(
            duplicatedIndex + 1,
            duplicatedIndex + 1 + 15 + indexMargin - 3,
          ),
        ];
        expect(array.toArray(), 'content after reload').to.deep.equal(expectedArray);
      });
  });

  it('replaces array content by jumping to index forward without cache', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const indexMargin = 2;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
      indexMargin,
    });
    return wait()
      .then(() => {
        fetchSpy.reset();
        array.jump(60, 30, -3);
        return wait();
      })
      .then(() => {
        expect(fetchSpy).to.be.calledWith(60, 30 + indexMargin * 2, -3 - indexMargin);
        expect(array.toArray(), 'content after jump').to.deep.equal(
          recordRange(60 - 3 - indexMargin, 60 + 30 - 3 + indexMargin),
        );
      });
  });

  it('sets proper startIndex and endIndex when array is too small after jump', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 10;
    // how many items will be fetched after jump will be used
    const expectedSize = 10;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
      chunkSize,
    });
    return wait()
      .then(() => {
        fetchSpy.reset();
        array.jump(defaultMockArraySize - expectedSize, 50);
        return wait();
      })
      .then(() => {
        // fetch prev will be used after jump, so indexes will be moved by chunkSize
        expect(get(array, 'startIndex'), 'start').to.equal(chunkSize);
        expect(get(array, 'endIndex'), 'end').to.equal(chunkSize + expectedSize);
      });
  });

  it('modifies source array after jump to contain requested range and prev next chunks',
    function () {
      const fetchSpy = sinon.spy(this.fetch);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10,
        indexMargin: 0,
      });
      return wait()
        .then(() => {
          fetchSpy.reset();
          array.jump(60, 30);
          return wait();
        })
        .then(() => {
          expect(fetchSpy, 'jump fetch call').to.be.calledWith(60, 30);
          const source = array.get('sourceArray').toArray();
          expect(source, `source after jump ${inspect(array)}`)
            .to.deep.equal(recordRange(30, 120));
        });
    }
  );
});
