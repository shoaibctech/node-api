const API = require("@aws-amplify/api").default;
const graphqlOperation = require("@aws-amplify/api").graphqlOperation;

module.exports.config = {
  aws_appsync_graphqlEndpoint:
    "https://mwdqlf2ov5h6lhoompdctcsvvy.appsync-api.eu-west-2.amazonaws.com/graphql",
  aws_appsync_region: "eu-west-2",
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: "da2-gpf3ykg375bpbpmnn6kq47skv4",
};

const subscribeDoc = /* GraphQL */ `
  subscription Subscribe($name: String!) {
    subscribe(name: $name) {
      data
      name
    }
  }
`;

const publishDoc = /* GraphQL */ `
  mutation Publish($data: AWSJSON!, $name: String!) {
    publish(data: $data, name: $name) {
      data
      name
    }
  }
`;

/**
 * @param  {string} name the name of the channel
 * @param  {Object} data the data to publish to the channel
 */
module.exports.publish = async function publish(name, data) {
  return await API.graphql(graphqlOperation(publishDoc, { name, data }));
};

/**
 * @param  {string} name the name of the channel
 * @param  {nextCallback} next callback function that will be called with subscription payload data
 * @param  {function} [error] optional function to handle errors
 * @returns {Observable} an observable subscription object
 */
module.exports.subscribe = function subscribe(name, next, error) {
  return API.graphql(graphqlOperation(subscribeDoc, { name })).subscribe({
    next: ({ provider, value }) => {
      next(value.data.subscribe, provider, value);
    },
    error: error || console.log,
  });
};

/**
 * @callback nextCallback
 * @param {Object} data the subscription response including the `name`, and `data`.
 * @param {Object} [provider] the provider object
 * @param {Object} [payload] the entire payload
 */
