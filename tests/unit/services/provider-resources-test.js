import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import clearStore from '../../helpers/clear-store';

describe('Unit | Service | provider-resources', function () {
  const { beforeEach, afterEach } = setupTest();

  beforeEach(function () {
    this.destroyables = [];
  });

  afterEach(function () {
    clearStore();
    for (const destroyable of this.destroyables) {
      destroyable.destroy();
    }
  });

  it('resolves new ChunkableListModel with provider spaces list', async function () {
    const providerResourcesService = this.owner.lookup('service:provider-resources');

    const store = this.owner.lookup('service:store');
    const space1 = await store.createRecord('space', {
      name: 'space-1',
    }).save();
    const spaceList1 = await store.createRecord('spaceList', {
      list: [space1],
    }).save();
    const provider1 = await store.createRecord('provider', {
      name: 'provider-1',
      spaceList: spaceList1,
    }).save();

    const chunkableListModel =
      await providerResourcesService.resolveChunkableSpaceListModel(provider1);
    this.destroyables.push(chunkableListModel);
    await chunkableListModel.chunksArray.initialLoad;

    expect(chunkableListModel.chunksArray.toArray()[0]).to.equal(space1);
  });

  it('resolves single ChunkableListModel instance for particular provider', async function () {
    const providerResourcesService = this.owner.lookup('service:provider-resources');

    const store = this.owner.lookup('service:store');
    const spaceList = await store.createRecord('spaceList', {
      list: [],
    }).save();
    const provider = await store.createRecord('provider', {
      name: 'provider-1',
      spaceList: spaceList,
    }).save();

    const chunkableListModel1 =
      await providerResourcesService.resolveChunkableSpaceListModel(provider);
    const chunkableListModel2 =
      await providerResourcesService.resolveChunkableSpaceListModel(provider);
    this.destroyables.push(chunkableListModel1, chunkableListModel2);
    await chunkableListModel1.chunksArray.initialLoad;
    await chunkableListModel2.chunksArray.initialLoad;

    expect(chunkableListModel1).to.equal(chunkableListModel2);
  });
});
