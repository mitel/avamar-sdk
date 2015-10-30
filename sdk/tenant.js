import rest from 'restling';
import api from './apiConfig'; 

/**
 * Tenants are a logical separation of clients and resources. 
 * They are typically separated for security reasons. Typically companies, 
 * departments or even groups with in IT are tenants. However, they can be 
 * any grouping that you may need.
 *
 * @param {String} authToken An authentication token received after a call to login()
 *
 * @param {String} serviceProviderId An id associated with this Service Provider controlling
 * the REST API Server. The relation between an SP and a REST Server is 1:1.
 *
 * @param {Object} [tenantConfig] A JSON object with the following keys:
 *  - name: a unique String for this tenant resource
 * This is an optional parameter. If not specified, the default values from apiConfig will be used.
 *
 * @returns {Promise} A JavaScript Promise object that may eventually resolve into a 
 * an object with the following keys:
 *  - tenantId: a unique id alocated to this tenant
 *  - data: the raw JSON result data
 *  - response: the raw JSON response from the server
 * If an error occurs the Promise will reject with an Error object
 */
export function createTenant(authToken, serviceProviderId, 
  tenantConfig = api.initialConfig.tenant) {
  // console.log(_requestOptions.password);

  const _data = JSON.stringify({ ...tenantConfig });

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/admin/provider/' + serviceProviderId + '/tenant';
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
    data: _data,
  };

  return new Promise((resolve, reject) => {
    rest.post(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        tenantId: result.data.id,
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
    note: Will fail if tenant has folder or sub tetnants

    creates a task
  */
export function deleteTenant(authToken, tenantId) {
  
  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/tenant/' + tenantId;
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

