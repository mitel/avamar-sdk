import rest from 'restling';
import api from './apiConfig';

/**
 * A data protection resource is an Avamar server.
 *
 * @param {String} authToken An authentication token received after a call to login()
 *
 * @param {String} resourcePoolId An id associated with the resource pool that owns this 
 * data protection resource
 *
 * @param {Object} [dprConfig] A JSON object with the following keys:
 *  - name: a unique String for this data protection resource
 *  - user: admin credentials for the Avamar server
 *  - password: password for the admin user
 *  - protocol: normally its https
 *  - hostname: the hostname
 *  - port: default should be 9443,
 *  - path: default is '/services/mcsdk10'
 * This is an optional parameter. If not specified, the default values from apiConfig will be used.
 *
 * @returns {Promise} A JavaScript Promise object that may eventually resolve into a 
 * an object with the following keys:
 *  - dataProtectionResourceId: a unique id alocated to this DPR
 *  - data: the raw JSON result data
 *  - response: the raw JSON response from the server
 * If an error occurs the Promise will reject with an Error object
 */
export function createDataProtectionResource(authToken, resourcePoolId, 
  dprConfig = api.initialConfig.dataProtectionResource) {

  const _data = JSON.stringify({ ...dprConfig });

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/admin/resourcePool/' + resourcePoolId + '/dataProtectionResource';
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
    data: _data,
  };

  return new Promise((resolve, reject) => {
    rest.post(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        dataProtectionResourceId: result.data.id,
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
    note: Fails if it is used by Resouce share.
  */
export function deleteDataProtectionResource(authToken, dprId) {
  
  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/admin/dataProtectionResource/' + dprId;
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
