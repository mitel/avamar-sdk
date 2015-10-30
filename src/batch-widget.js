/*
    Automation widget to deploy/delete Avamar resources for a service provider through code.
*/

import initSDK from '../sdk/initSDK';

let session, resourcePool, dpr, tenant, resourceShare, folder; // eslint-disable-line
const sdk = initSDK();

// uses JavaScript ES7 async/await syntax
export async function batchCreate() {

  try {
    session = await sdk.login(); 
    console.log('logged in.. ');

    console.log('start creating resources..');

    resourcePool = await sdk.createResourcePool(session.authToken, session.serviceProviderId);
    console.log('created resource pool.. ');

    dpr = await sdk.createDataProtectionResource(session.authToken, resourcePool.resourcePoolId);
    console.log('created dpr..');

    tenant = await sdk.createTenant(session.authToken, session.serviceProviderId);
    console.log('created tenant..');

    const _dprUrl = `https://${sdk.config.restServerHost}:${sdk.config.restServerPort}/rest-api/admin/dataProtectionResource/${dpr.dataProtectionResourceId}`;
    const _dataProtectionResources = [{ 
      href: _dprUrl,
    }];
    resourceShare = await sdk.createResourceShare(session.authToken, resourcePool.resourcePoolId, _dataProtectionResources);
    await sdk.assignResourceShare(session.authToken, resourceShare.resourceShareId, tenant.tenantId);
    console.log('created and assigned resource share..');

    const folderTask = await sdk.createFolder(session.authToken, resourceShare.resourceShareId, tenant.tenantId);
    folder = await sdk.getTaskResult(session.authToken, folderTask.taskId);
    console.log('created folder..');

    await sdk.logout(session.authToken);
    console.log('logged out..');
  } catch (err) {
    console.log(err);
  }
}

export async function batchDelete() {

  try {
    session = await sdk.login();
    console.log('logged in.. ');

    console.log('start deleting resources..');
    
    const task1 = await sdk.deleteFolder(session.authToken, folder.resultId);
    await sdk.getTaskResult(session.authToken, task1.taskId);
    console.log('deleted folder..');

    const task2 = await sdk.deleteResourceShare(session.authToken, resourceShare.resourceShareId);
    // await getTaskResult(session.authToken, task2.taskId); // the task object gets deleted after finish
    console.log('deleted resource share..');

    const task3 = await sdk.deleteTenant(session.authToken, tenant.tenantId);
    // await getTaskResult(session.authToken, task3.taskId);
    console.log('deleted tenant..');

    const task4 = await sdk.deleteDataProtectionResource(session.authToken, dpr.dataProtectionResourceId);
    // await getTaskResult(session.authToken, task4.taskId);
    console.log('deleted dpr..');

    const task5 = await sdk.deleteResourcePool(session.authToken, resourcePool.resourcePoolId);
    // await getTaskResult(session.authToken, task5.taskId);
    console.log('deleted resource pool..');

    await sdk.logout(session.authToken);
    console.log('logged out..');
  } catch (err) {
    console.log(err);
  }

}

