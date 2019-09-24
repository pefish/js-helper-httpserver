/** @module */

export default async (req, res, next, params) => {
  const userAuth = require('basic-auth')(req)
  if (!userAuth) {
    throw new Error(`permission error`)
  }
  const { users } = params
  for (const { user, pass } of users) {
    if (user === userAuth['name'] && pass === userAuth['pass']) {
      req['basicAuth'] = userAuth
      return true
    }
  }
  throw new Error(`permission error`)
}
