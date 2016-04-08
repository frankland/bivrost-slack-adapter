export default function slackApi(api, config) {
  const { adapter, channel, token } = config;

  if (!channel || !token || !adapter) {
    throw new Error('"chanel" && "token" && "adapter" should be defined for Bivrost slack api');
  }

  const slackRequest = {
    channel,
    token,
    pretty: 1,
    as_user: true
  };

  let instance = api({
    ...config,
    base: 'https://slack.com/',
    prefix: 'api',
    adapter: (url, applicationRequest = {}, interceptors) => {
      let request = {};

      if (applicationRequest.verb == 'POST') {
        request = {
          ...applicationRequest,
          body: {
            ...applicationRequest.body,
            ...slackRequest,
            attachments: JSON.stringify(applicationRequest.body.attachments || {})
          }
        }
      } else if (applicationRequest.verb == 'GET') {
        request = {
          ...applicationRequest,
          query: {
            ...applicationRequest.query,
            ...slackRequest,
            attachments: JSON.stringify(applicationRequest.query.attachments || {})
          }
        }
      }

      return adapter(url, request, interceptors)
        .then(response => {
          if (response.ok) {
            return response;
          } else {
            return Promise.reject(response);
          }
        });
    }
  });

  Object.assign(instance, {
    message: instance('GET /chat.postMessage')
  });

  return instance;
}
