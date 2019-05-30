import ErrorHelper from '@pefish/js-error'

export default (req, res, next, params) => {
  const multer = require('multer')
  return new Promise((resolve, reject) => {
    const { filesName } = params
    const upload = multer().array(filesName)
    upload(req, res, (err) => {
      if (err) {
        reject(new ErrorHelper('失败', 0, null, err))
        return
      }
      req['body'][filesName] = req['files']
      resolve()
    })
  })
}