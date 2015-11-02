import chai, { expect } from 'chai';
import { batchCreate, batchDelete } from '../src/batch-widget';

describe('batch test', function() { // eslint-disable-line
  
  this.timeout(0);

  it('run a batch of create actions', () => {
    const promise = batchCreate();
    return promise.then(r => {
      expect(r).to.be.fullfilled;
    });
  });

  // replace with it.skip(..) if you want to leave the resources created
  it('run a batch of delete actions', () => {
    const promise = batchDelete();
    return promise.then(r => {
      expect(r).to.be.fullfilled;
    });
  });
});
