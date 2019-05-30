import ErrorHelper from '@pefish/js-error'

export default class Test {

  async test (req, res, next, params) {
    const { user_id, amount } = req['params']
    throw new ErrorHelper('gdhsgfh')
    return {f: req['basicAuth']}
  }

  async test1 (req, res) {
    const { user_id, start_time } = req['params']
    return req['params']
  }
}
