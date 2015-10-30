import rest from 'restling';
import api from './apiConfig';

// const api = apiConfig(); 

/**
 * Resource Shares are used to limit the amount of space that is allocated 
 * to each Tenant. They also map Tenants to the Resource Pools and thus to 
 * the Data Protection Resources (Avamar servers) that they will use.
 * notes: 
 *  - Fails if the resource share doesn't have at least one Data Protection Resource.
 *  - a Resource Share is actually an abstraction over a sum of slices from different DPRs
 *    eg: you can have 2TB from DPR1, plus 3TB from DPR2. The total RS capacity will be 5TB
 *  - you can define multiple Resource Shares in a Resource Pool. This makes sense if you have 
 *    multiple tenants that consume storage from the same Resource Pool
 *  - A tenant may have at most one Resource Share per Resource Pool. A standard case would be 
 *    a Tenant having one RS in RP1 (main DC) and one RS in RP2 (in DR).
 *
 * @param {String} authToken An authentication token received after a call to login()
 *
 * @param {String} resourcePoolId An id associated with the owning resource pool
 *
 * @param {Object} dataProtectionResources A vector containing at least one data protection resource
 * eg:  [{ 
 *        href: 'https://192.168.1.100:8543/rest-api/admin/dataProtectionResource/' + dataProtectionResourceId,
 *      }]
 *
 * @param {Object} [resourceShareConfig] A JSON object with the following keys:
 *  - name: a unique String for this resource share
 *  - capacityInMB: the total storage alocated from the different data protection resources
 * This is an optional parameter. If not specified, the default values from apiConfig will be used.
 *
 * @returns {Promise} A JavaScript Promise object that may eventually resolve into a 
 * an object with the following keys:
 *  - tenantId: a unique id alocated to this tenant
 *  - data: the raw JSON result data
 *  - response: the raw JSON response from the server
 * If an error occurs the Promise will reject with an Error object
 */
export function createResourceShare(authToken, resourcePoolId, dataProtectionResources, 
  resourceShareConfig = api.initialConfig.resourceShare) {
  
  const _data = JSON.stringify({
    dataProtectionResource: [...dataProtectionResources], ...resourceShareConfig, 
  });

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/admin/resourcePool/' + resourcePoolId + '/resourceShare';
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
    data: _data,
  };

  return new Promise((resolve, reject) => {
    rest.post(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        resourceShareId: result.data.id,
        data: result.data,
        response: result.response, 
      });
    }, error => {
      // console.log(error);
      return reject(error);
    });  
  });
}

// assigns a resource share to a tenant
export function assignResourceShare(authToken, resourceShareId, tenantId) {
  const _data = JSON.stringify({ 
    href: 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/resourceShare/' + resourceShareId,
  });

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/tenant/' + tenantId + '/resourceShare';
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
    data: _data,
  };

  return new Promise((resolve, reject) => {
    rest.put(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        data: result.data,
        response: result.response, 
      });
    }, error => {
      // console.log(error);
      return reject(error);
    });  
  });
}

/*
    Delete a resourceShare. All objects on the resourceShare will be permanently removed. 
    The resources will be returned to the resourcePool.
    Fails if the resource share is used by folder.

    Creates a task - it usually runs fast 
  */
export function deleteResourceShare(authToken, resourceShareId) {
  
  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/resourceShare/' + resourceShareId;
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
  };

  return new Promise((resolve, reject) => {
    rest.del(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        taskId: result.data.id,
        data: result.data,
        response: result.response, 
      });
    }, error => {
      // console.log(error);
      return reject(error);
    });  
  });
}

