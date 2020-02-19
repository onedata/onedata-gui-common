import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import ReplacingChunksArray, { emptyItem } from 'onedata-gui-common/utils/replacing-chunks-array';
import _ from 'lodash';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { Promise, resolve } from 'rsvp';
import { get } from '@ember/object';

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
    this.array = recordRange(0, 1000);
  }
  fetch(
    fromId,
    size = Number.MAX_SAFE_INTEGER,
    offset = 0
  ) {
    if (fromId == null) {
      fromId = Number.MIN_SAFE_INTEGER;
    }
    let startIndex = 0;
    for (let i = 0; i < this.array.length; ++i) {
      startIndex = i;
      if (this.array[i].index >= fromId) {
        break;
      }
    }
    const startOffset = Math.max(
      0,
      Math.min(startIndex + offset, this.array.length - size)
    );
    return Promise.resolve(this.array.slice(startOffset, startOffset + size));
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

const gteMatcher = (compareValue) => {
  return sinon.match(
    value => value >= compareValue,
    `greater or equal ${compareValue}`
  );
}

describe('Unit | Utility | replacing chunks array', function () {
  beforeEach(function () {
    this.mockArray = new MockArray();
    this.fetch = MockArray.prototype.fetch.bind(this.mockArray);
  });

  it('exposes fragment of internal array and fetches new chunks', function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 10,
      indexMargin: 5,
      chunkSize: 5,
    });
    return get(array, 'initialLoad').then(() => {
      expect(fetchSpy, 'initial fetch').to.be.calledOnce;
      expect(fetchSpy).to.be.calledWith(
        null,
        15,
        0
      );
      expect(get(array, 'sourceArray.length'), 'source length after init')
        .to.equal(15);
      expect(get(array, 'length'), 'length after init').to.equal(15);
      expect(array.toArray(), 'content after init: ' + array.mapBy('index'))
        .to.deep.equal(recordRange(0, 15));

      array.setProperties({
        startIndex: 5,
        endIndex: 15,
      });
      return wait()
        .then(() => {
          expect(fetchSpy, 'fetch after index change').to.be.calledTwice;
          expect(get(array, 'length'), 'length after index change')
            .to.equal(20);
          expect(array.toArray(), 'content after index change')
            .to.deep.equal(recordRange(0, 20));
        });
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
        expect(fetchSpy, 'initial fetch').to.be.calledOnce;
        expect(fetchSpy, 'initial fetch starts with null')
          .to.be.calledWith(null, 10, 0);
        array.reload();
        return wait();
      })
      .then(() => {
        expect(fetchSpy, 'fetch after reload').to.be.calledTwice;
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
        expect(fetchSpy, 'initial fetch').to.be.calledOnce;
        array.setProperties({
          startIndex: 15,
          endIndex: 45,
        });
        return wait();
      })
      .then(() => {
        expect(fetchSpy, 'fetch records needed to fill start to end')
          .to.be.calledWith(19, gteMatcher(25), 1);
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
          expect(fetchSpy).to.be.calledOnce;
          array.setProperties({
            startIndex: 30,
            endIndex: 40,
          });
          array.reload();
          return wait();
        })
        .then(() => {
          expect(fetchSpy).to.be.calledTwice;
          expect(fetchSpy).to.be.calledWith(30, 10, 0)
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
          expect(fetchSpy).to.have.callCount(1);
          expect(fetchSpy).to.have.been.calledWith(
            null,
            60,
            0
          );
          array.setProperties({
            startIndex: 20,
            endIndex: 60,
          });
          return wait();
        })
        .then(() => {
          expect(fetchSpy).to.have.callCount(2);
          expect(fetchSpy).to.have.been.calledWith(
            59, // index of last element
            chunkSize,
            1
          );
          expect(array.toArray(), 'array content after index change to forth')
            .to.deep.equal(recordRange(10, 70));
          array.reload();
          return wait();
        })
        .then(() => {
          expect(fetchSpy).to.have.callCount(3);
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

  it('loads new data below 0 index', function () {
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
        const expectedArray = [
          frontRecord1,
          frontRecord2,
          ...recordRange(0, 58)
        ];
        expect(actualArray)
          .to.deep.equal(expectedArray);
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
          })
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
});
