import rest from 'restling';
import api from './apiConfig';

/**
 * Resource Pool - a logical grouping of Avamar servers
 * You can reate a Resource Pool for each physical location (datacenter) and for each set of 
 * resources within a datacenter that need to stay physically separated for a certain tenant 
 * who requires not only logical but physical separation of its own resources.
 *
 * @param {String} authToken An authentication token received after a call to login()
 *
 * @param {String} serviceProviderId An id associated with this Service Provider controlling
 * the REST API Server. The relation between an SP and a REST Server is 1:1.
 *
 * @param {Object} [resourcePoolConfig] A JSON object with the following keys:
 *  - name: a unique String for this resource pool
 * This is an optional parameter. If not specified, the default values from apiConfig will be used. 
 *
 * @returns {Promise} A JavaScript Promise object that may eventually resolve into a 
 * an object with the following keys:
 *  - resourcePoolId: a unique id alocated to this resource pool
 *  - data: the raw JSON result data
 *  - response: the raw JSON response from the server
 * If an error occurs the Promise will reject with an Error object
 */
export function createResourcePool(authToken, serviceProviderId, 
  resourcePoolConfig = api.initialConfig.resourcePool) {

  const _data = JSON.stringify({ ...resourcePoolConfig });

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/admin/provider/' + serviceProviderId + '/resourcePool';
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
    data: _data,
  };

  return new Promise((resolve, reject) => {
    rest.post(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        resourcePoolId: result.data.id,
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
    note: A resourcePool still having any dataProtectionResource system connected is not allowed to be deleted.
  */
export function deleteResourcePool(authToken, resourcePoolId) {
  
  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/admin/resourcePool/' + resourcePoolId;
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

