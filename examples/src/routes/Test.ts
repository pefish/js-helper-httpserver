
export default [
  {
    path: '/test',
    method: 'get',
    apiHandler: 'test',
    preHandlers: {
      api_params_validate: {},
    },
    params: {

    }
  },
  {
    path: '/test1',
    method: 'post',
    apiHandler: 'test1',
    preHandlers: {
      api_params_validate: {},
    },
    params: {

    },
  }
]