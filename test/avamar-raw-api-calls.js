/*
  tests with hardcoded values - make sure you change the IP, user/password etc
  skipped by default with npm run test

  Credits to LGTOman's Blog for a great walkthrough of the API:
  https://community.emc.com/blogs/LGTOman/2015/07/31/getting-started-with-the-avamar-rest-api-and-vmware-backups

  Avamar credentials:
  admin/P@ssword01
  IP: sudo /etc/init.d/network restart eth0

  REST server credentials:
  admin/password

  Enterprise Manager
  MCUser/password01

*/


// import { expect } from 'chai';
import expect from 'expect.js';
import { parseString, processors } from 'xml2js';
// import { parseNumbers, parseBooleans } from 'xml2js/lib/processors';
import restler from 'restler';
import sleep from 'sleep';

describe.skip('XML to JSON test', () => {
  it('should deep equal', () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
    let a;

    parseString(xml, { explicitArray: false }, function(err, result) {
      // a = JSON.stringify(result);
      a = result;
      // console.log(a);
      // console.log(JSON.stringify(result));
    });

    const expectedResponse = {
      "business": {
        "company": "Code Blog" ,
        "owner": "Nic Raboy",
        "employee": [
          {
            "firstname": "Nic",
            "lastname": "Raboy",
          },
          {
            "firstname": "Maria",
            "lastname": "Campos",
          },
        ],
      },
    };
    expect(a).to.eql(expectedResponse);
  });
});

describe.skip('Integration tests - Avamar REST calls: ', function() { 

  this.timeout(0);

  let authToken;
  let serviceProviderId;
  let resourcePoolId;
  let dataProtectionResourceId;
  let tenantId;
  let resourceShareId;
  let taskId;
  let folderId;

  /*
    curl -k -D- --user admin:password -X POST -H "Accept: application/json" -H "Content-Type: application/json" https://192.168.1.100:8543/rest-api/login
  */
  before('should login', (done) => {
    restler.post('https://192.168.1.100:8543/rest-api/login', 
      { 
        // timeout: 1900,
        username: 'admin',
        password: 'password',
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(201);
        authToken = response.headers['x-concerto-authorization']; 
        serviceProviderId = result.accessPoint[0].id;
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    curl -k -D- -X POST -H "Accept: application/json" -H "Content-Type: application/json" -H "x-concerto-authorization: xxx" https://192.168.1.100:8543/rest-api/logout
  */
  after('should logout', (done) => {
    restler.post('https://192.168.1.100:8543/rest-api/logout', 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'x-concerto-authorization': authToken,
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(204);
        expect(response.headers.connection).to.equal('close'); 
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  it('should get version - XML response', (done) => {
    restler.get('https://192.168.1.100:8543/rest-api/versions', 
      { 
        xml2js: { // restler uses xml2js behind, so you can configure that
          
          // Always put child nodes in an array if true; otherwise an array 
          // is created only if there is more than one.
          explicitArray: false,

          // Ignore all XML attributes and only create text nodes.
          ignoreAttrs: true,

          // Merge attributes and child elements as properties of the parent, 
          // instead of keying attributes off a child attribute object. 
          // This option is ignored if ignoreAttrs is false.
          mergeAttrs: false, 

          // valueProcessors: [processors.parseNumbers, processors.parseBooleans],
        },
        timeout: 1900,
      })
      .on('complete', (result, response) => {
        expect(result.EntryPointList.EntryPoint[0].ApiVersion).to.equal('1.0');
        expect(result.EntryPointList.EntryPoint[1].ApiVersion).to.equal('2.0');
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    curl -i -X GET -k -H "Accept: application/json" -H "Content-Type: application/json"  https://192.168.1.100:8543/rest-api/admin/provider/{id}/resourcePool
  */
  it('should get version - JSON response', (done) => {
    restler.get('https://192.168.1.100:8543/rest-api/versions', 
      { 
        timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
        },
      })
      .on('complete', (result, response) => {
        expect(result.entryPoint[0].apiVersion).to.equal('1.0');
        expect(result.entryPoint[1].apiVersion).to.equal('2.0');
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    test for creating a resource pool
      - resource pool - a logical grouping of Avamar servers
      - you create a Resource Pool for each physical location (datacenter) and for each set of 
      resources that need to stay physically separate for a certain tenant who requires
      this
  */
  it('should create a Resource Pool', (done) => {

    const data = JSON.stringify({
      name: 'RP1', 
    });

    restler.post('https://192.168.1.100:8543/rest-api/admin/provider/' + serviceProviderId + '/resourcePool', 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
        data: data,
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(201);
        resourcePoolId = result.id;
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    test for creating a Data Protection Resource (an Avamar server)
    and assigning it to an existing Resource Pool
  */
  it('should create a Data Protection Resource', (done) => {

    const data = JSON.stringify({
      name: 'DPR1',
      user: 'MCUser',
      password: 'password01',
      protocol: 'https',
      hostname: 'avamar',
      port: 9443,
      path: '/services/mcsdk10',
    });

    restler.post('https://192.168.1.100:8543/rest-api/admin/resourcePool/' + resourcePoolId + '/dataProtectionResource', 
      { 
        // timeout: 5000,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
        data: data,
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(201);
        // console.log(result);
        dataProtectionResourceId = result.id;
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    test for creating a Tenant
      Tenants are a logical separation of clients and resources. 
      They are typically separated for security reasons. Typically companies, 
      departments or even groups with in IT are tenants. However, they can be 
      any grouping that you may need.
  */

  it('should create a Tenant', (done) => {

    const data = JSON.stringify({
      name: 'Tenant1', 
    });

    restler.post('https://192.168.1.100:8543/rest-api/admin/provider/' + serviceProviderId + '/tenant', 
      { 
        timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
        data: data,
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(201);
        // console.log(result);
        tenantId = result.id;
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    test for creating a Resource Share in a Resource Pool
      Resource Shares are used to limit the amount of space that is allocated 
      to each Tenant. They also map Tenants to the Resource Pools and thus to 
      the Data Protection Resources (Avamar servers) that they will use.

    notes: 
      - Fails if the resource share doesn't have at least one Data Protection Resource.
      - a Resource Share is actually an abstraction over a sum of slices from different DPRs
      eg: you can have 2TB from DPR1, plus 3TB from DPR2. The total RS capacity will be 5TB
      - you can define multiple Resource Shares in a Resource Pool. This makes sense if you have 
      multiple tenants that consume storage from the same Resource Pool
      - A tenant may have at most one Resource Share per Resource Pool. A standard case would be 
      a Tenant having one RS in RP1 (main DC) and one RS in RP2 (in DR).
  */
  it('should create a Resource Share', (done) => {

    const data = JSON.stringify({
      name: 'RS1',
      capacityInMB: 200,
      dataProtectionResource: [{ 
        href: 'https://192.168.1.100:8543/rest-api/admin/dataProtectionResource/' + dataProtectionResourceId,
      }],
    });

    restler.post('https://192.168.1.100:8543/rest-api/admin/resourcePool/' + resourcePoolId + '/resourceShare', 
      { 
        // timeout: 5000,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
        data: data,
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(201);
        // console.log(result);
        resourceShareId = result.id;
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    Assign Resource Share to tenant.
    Fails if the assigning resource share has already a tenant assigned.
  */
  it('should assign a Resource Share to a Tenant', (done) => {

    const data = JSON.stringify({
      href: 'https://192.168.1.100:8543/rest-api/resourceShare/' + resourceShareId,
    });

    restler.put('https://192.168.1.100:8543/rest-api/tenant/' + tenantId + '/resourceShare', 
      { 
        // timeout: 5000,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
        data: data,
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(200);
        // console.log(result);
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    Creates a top-level folder for the tenant, request must specify a resourceShare.
    This is an async operation, so the resut is a Task object, not the actual Folder object
  */
  it('should create a Task that creates a Folder for a Tenant', (done) => {

    const data = JSON.stringify({
      folder: {
        name: 'Tenant1Folder1',
        resourceShare: {
          href: 'https://192.168.1.100:8543/rest-api/resourceShare/' + resourceShareId,
        },
      },
    });

    restler.post('https://192.168.1.100:8543/rest-api/tenant/' + tenantId + '/folder', 
      { 
        // timeout: 5000,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
        data: data,
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(202);
        // console.log(result);
        taskId = result.id;
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  it('should wait for a Task [create folder] to finish', function(done) {
    // sleep.sleep(20);
    restler.get('https://192.168.1.100:8543/rest-api/task/' + taskId, 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
      })
      .on('complete', function(result, response) {
        if (result.state !== 'SUCCESS') {
          // console.log(result);
          this.retry(500);
        } else {
          expect(result.state).to.equal('SUCCESS');
          // console.log(result);
          folderId = result.result.id;
          done();
        }
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    Deletes a folder. 
    Fails if any child/children exist. 
    Force and recursive query params can be used to force delete the clients and traverse 
    folder recursively for deletion.
  */
  it('should delete a Folder', (done) => {
    // sleep.sleep(20);
    restler.del('https://192.168.1.100:8543/rest-api/folder/' + folderId, 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(202);
        // console.log(response);
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });


  /*
    Delete a resourceShare. All objects on the resourceShare will be permanently removed. 
    The resources will be returned to the resourcePool.
    Fails if the resource share is used by folder.
  */
  it('should delete a Resource Share', (done) => {
    sleep.sleep(8); // sometimes the API endpoint crashes on batch commands (the delete folder command is still running in the background)
    restler.del('https://192.168.1.100:8543/rest-api/resourceShare/' + resourceShareId, 
      { 
        timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(202);
        // console.log(result);
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    note: Will fail if tenant has folder or sub tetnants
  */
  it('should delete a Tenant', (done) => {

    restler.del('https://192.168.1.100:8543/rest-api/tenant/' + tenantId, 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(202);
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    note: Fails if it is used by Resouce share.
  */
  it('should delete a Data Protection Resource', (done) => {

    restler.del('https://192.168.1.100:8543/rest-api/admin/dataProtectionResource/' + dataProtectionResourceId, 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(202);
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

  /*
    note: A resourcePool still having any dataProtectionResource system connected is not allowed to be deleted.
  */
  it('should delete a Resource Pool', (done) => {

    restler.del('https://192.168.1.100:8543/rest-api/admin/resourcePool/' + resourcePoolId, 
      { 
        // timeout: 1900,
        headers: {
          'Accept': 'application/json; version=1.0',
          'Content-Type': 'application/json; version=1.0',
          'X-Concerto-Authorization': authToken,
        },
      })
      .on('complete', (result, response) => {
        expect(response.statusCode).to.equal(202);
        done();
      })
      .on('timeout', (ms) => {
        expect().fail('Timeout - check connectivity');
        done();
      });
  });

});
