#EMC Avamar JavaScript SDK

A tentative to wrap the EMC Avamar REST API into a more simple and intuitive framework for developers. The code here is not supported in any way by EMC Corp. I developed it just to play around with the API and experiment with the new ES6/ES7 JavaScript syntax.

Currently this is just an alpha version with few of the REST API calls implemented as JavaScript async functions: 
`login, logout, createResourcePool, deleteResourcePool, createDataProtectionResource, deleteDataProtectionResource, createTenant, deleteTenant, createResourceShare, assignResourceShare, deleteResourceShare, createFolder, deleteFolder, getTaskResult`. 

Contributions and suggestions are welcomed. Still a lot of work to be done for extending the SDK, error handling and so on.

The current code was tested with an Avamar 7.1.2 Virtual Edition instance and Avamar REST API 7.2.0-390 installed.

Some of the benefits of using a JavaScript SDK wrapper:
- JavaScript is now one of the most popular programming languages for both client-side and server-side development
- an SDK offers developers a higher level programming interface compared to low-level HTTP REST calls
- all the functions are non-blocking (async) using the standard JavaScript Promise API
- supported client-side: browser apps (Angular, React) and mobile apps built with JavaScript (Cordova, React Native etc)
- supported on the server-side with Node.js backends

##Getting Started

Deploy your EMC Avamar server and the REST API package (contact your EMC rep for that).

Install Node.js - I suggest checking the NVM project here: https://github.com/creationix/nvm

Clone this repository, open a terminal and run `npm install`.

Edit `sdk/apiConfig.js` with your own REST API and Avamar settings.

Import the `initSDK` module into your project. Please check the `batch-widget` for an example.

## Example automation widget

http://recordit.co/Qnt5UoXhw4

`src/batch-widget` uses this SDK to configure a simple backup-as-a-service environment for a service provider. It logs-in using the provided credentials (`sdk/apiConfig.js`), creates a resource pool, a data protection resource (an Avamar server), a tenant, a resource share and a folder. It is a very basic but powerful usage example of this SDK that enables configuration-as-code for BaaS environments. 

To test this widget you need to follow the steps from `Getting Started` and then `npm run test` that uses the popular Mocha testing framework.

Some of the benefits of treating your configuration/deployments as code:
- coding alows both simple and complex scenarios: batches such as the one in this example but also actions that are conditioned by other actions (IF/ELSE clauses into the code), paralel executions etc
- code versioning and collaboration through tools like Github
- open sourcing best practices as code
- executable documentation: solution architects may design BaaS environments through code, run tests and then hand over that design to their customers or implementation specialists 
- enables easy migration and replicating backup configurations to other environments
- modularizing the deployment: an architect may develop complex deployments in multiple source files, test and maintain them separately 
- writing automated integration tests where the backup environment integrates with other APIs such as cloud storage for long term retention 
