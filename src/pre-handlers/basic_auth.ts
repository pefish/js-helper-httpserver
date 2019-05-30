/** @module */

import ErrorHelper from '@pefish/js-error'


export default async (req, res, next, params) => {
  const userAuth = require('basic-auth')(req)
  if (!userAuth) {
    throw new ErrorHelper(`permission error`)
  }
  const { users } = params
  for (const { user, pass } of users) {
    if (user === userAuth['name'] && pass === userAuth['pass']) {
      req['basicAuth'] = userAuth
      return true
    }
  }
  throw new ErrorHelper(`permission error`)
}
