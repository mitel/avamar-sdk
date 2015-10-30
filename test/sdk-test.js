import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import api from '../sdk/apiConfig';
import { login, loginES7, logout } from '../sdk/login';
import { createResourcePool, deleteResourcePool } from '../sdk/resourcePool';
import { createDataProtectionResource, deleteDataProtectionResource } from '../sdk/dataProtectionResource';
import { createTenant, deleteTenant } from '../sdk/tenant';
import { createResourceShare, assignResourceShare, deleteResourceShare } from '../sdk/resourceShare';
import { createFolder, deleteFolder } from '../sdk/folder';
import { getTaskResult } from '../sdk/task';

chai.use(chaiAsPromised);

describe.skip('sdk tests - mocha/chai', function() { // eslint-disable-line
  
  this.timeout(0);

  let authToken;
  let serviceProviderId;
  let resourcePoolId;
  let dataProtectionResourceId;
  let tenantId;
  let resourceShareId;
  let taskId;
  let folderId;

  it('should get the Accept HTTP Header from apiConfig', () => {
    expect(api.httpHeaders['Accept']).to.equal('application/json; version=1.0'); // eslint-disable-line
  });

  it('should login', () => {
    const promise = login();
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(201);
      authToken = r.response.headers['x-concerto-authorization']; 
      serviceProviderId = r.data.accessPoint[0].id;
    });
  });

  it('should create a ResourcePool', () => {
    const promise = createResourcePool(authToken, serviceProviderId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(201);
      resourcePoolId = r.data.id;
    });
  });

  it('should create a Data Protection Resource', () => {
    const promise = createDataProtectionResource(authToken, resourcePoolId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(201);
      dataProtectionResourceId = r.data.id;
    });
  });

  it('should create a Tenant', () => {
    const promise = createTenant(authToken, serviceProviderId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(201);
      tenantId = r.data.id;
    });
  });

  it('should create a Resource Share', () => {
    const _dataProtectionResources = [{ 
      href: 'https://192.168.1.100:8543/rest-api/admin/dataProtectionResource/' + dataProtectionResourceId,
    }];
    const promise = createResourceShare(authToken, resourcePoolId, _dataProtectionResources);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(201);
      resourceShareId = r.data.id;
    });
  });

  it('should assign a Resource Share to a Tenant', () => {
    const promise = assignResourceShare(authToken, resourceShareId, tenantId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(200);
    });
  });

  it('should create a Task that creates a Folder for a Tenant', () => {
    const promise = createFolder(authToken, resourceShareId, tenantId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(202);
      taskId = r.data.id;
    }, error => {
      console.log(error);
    });
  });

  it('should wait for a Task [create folder] to finish', () => {
    const promise = getTaskResult(authToken, taskId);
    return promise.then(r => {
      expect(r.data.state).to.equal('SUCCESS');
      folderId = r.resultId;
    }, error => {
      console.log(error);
    });
  });

  let deleteFolderTaskId;
  it('should create a Task that deletes a Folder', () => {
    const promise = deleteFolder(authToken, folderId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(202);
      // console.log(r.data);
      deleteFolderTaskId = r.data.id;
    }, error => {
      console.log(error);
    });
  });

  it('should wait for a Task [delete folder] to finish', () => {
    const promise = getTaskResult(authToken, deleteFolderTaskId);
    return promise.then(r => {
      expect(r.data.state).to.equal('SUCCESS');
    }, error => {
      console.log(error);
    });
  });

  let deleteResourceShareTaskId;
  it('should create a Task that deletes a Resource Share', () => {
    const promise = deleteResourceShare(authToken, resourceShareId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(202);
      // console.log(r.data);
      deleteResourceShareTaskId = r.data.id;
    }, error => {
      console.log(error);
    });
  });

  it('should wait for a Task [delete resource share] to finish', () => {
    const promise = getTaskResult(authToken, deleteResourceShareTaskId);
    return promise.then(r => {
      expect(r.data.state).to.equal('SUCCESS');
    }, error => {
      // console.log(error);
    });
  });

  let deleteTenantTaskId;
  it('should create a Task that deletes a Tenant', () => {
    const promise = deleteTenant(authToken, tenantId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(202);
      // console.log(r.data);
      deleteTenantTaskId = r.data.id;
    }, error => {
      console.log(error);
    });
  });

  it('should wait for a Task [delete tenant] to finish', () => {
    const promise = getTaskResult(authToken, deleteTenantTaskId);
    return promise.then(r => {
      expect(r.data.state).to.equal('SUCCESS');
    }, error => {
      // console.log(error);
    });
  });

  let deleteDprTaskId;
  it('should create a Task that deletes a DPR', () => {
    const promise = deleteDataProtectionResource(authToken, dataProtectionResourceId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(202);
      // console.log(r.data);
      deleteDprTaskId = r.data.id;
    }, error => {
      console.log(error);
    });
  });

  it('should wait for a Task [delete DPR] to finish', () => {
    const promise = getTaskResult(authToken, deleteDprTaskId);
    return promise.then(r => {
      expect(r.data.state).to.equal('SUCCESS');
    }, error => {
      // console.log(error);
    });
  });

  let deleteRpTaskId;
  it('should create a Task that deletes a Resource Pool', () => {
    const promise = deleteResourcePool(authToken, resourcePoolId);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(202);
      // console.log(r.data);
      deleteRpTaskId = r.data.id;
    }, error => {
      console.log(error);
    });
  });

  it('should wait for a Task [delete resource pool] to finish', () => {
    const promise = getTaskResult(authToken, deleteRpTaskId);
    return promise.then(r => {
      expect(r.data.state).to.equal('SUCCESS');
    }, error => {
      // console.log(error);
    });
  });

  it('should logout', () => {
    const promise = logout(authToken);
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(204);
      expect(r.response.headers.connection).to.equal('close'); 
    });
  });

  /* ************Experiments************* */

  // http://www.sitepoint.com/promises-in-javascript-unit-tests-the-definitive-guide/
  it.skip('should login - chai-as-promised', () => {
    const promise = login();
    return expect(promise.then(r => r.response.statusCode)).to.eventually.equal(201);
  });

  it.skip('should login - ES7', () => {
    const promise = loginES7();
    return promise.then(r => {
      expect(r.response.statusCode).to.equal(201);
    });
  });


});

