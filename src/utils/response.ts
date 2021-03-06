import ErrorHelper from '@pefish/js-error'
import fs from 'fs'
import path from 'path'

type ApiResult = {
	msg: string,
	code: number,
  data: any,
}

/**
 * api回复的工具类
 */
export default class ResponseUtil {
  static success (res, data: any): void {
    res.json(ResponseUtil.assembleSucceedRes(data))
  }

  static assembleSucceedRes (data: any): ApiResult {
    return {
      code: 0,
      msg: ``,
      data
    }
  }

  static failed (res, err): void {
    global.logger.error(err)
    res.json(ResponseUtil.assembleFailResp(err))
  }

  static assembleFailResp (err: Error): ApiResult {
    const errorCode = err instanceof ErrorHelper ? err._errorCode : 1
    return {
      msg: err.message,
      code: errorCode,
      data: (err instanceof ErrorHelper ? err._errorStorage : null),
    }
  }

  static sendImageBuffer (res, buffer, ext) {
    let type = 'png'
    switch (ext) {
      case 'jpg':
        type = 'jpeg'
        break
      case 'gif':
        type = 'gif'
        break
    }
    res.header('Content-Type', `image/${type}`)
    res.send(buffer)
  }

  static sendFile (res, datas, filename = require('uuid/v1')()) {
    res.attachment(filename)
    res.send(datas)
  }

  static render (req, res, page, title = '', data = {}, version = null) {
    version = version || require(path.join(path.dirname(require.main.filename), 'package.json'))['version']
    const distPath = `./client/src`
    let html = fs.readFileSync(path.join(distPath, `template/index.html`), 'utf-8')
    html = html.replace(/\$\{page\}/g, `${page}_${version}`)
    html = html.replace(/\$\{title\}/g, title)
    html = html.replace(/\$\{manifest\}/g, `manifest_${version}`)
    html = html.replace(/\$\{vendor\}/g, `vendor_${version}`)
    // 传递数据
    html = html.replace(/\$\{bridge\}/g, `
        window._params_ = ${JSON.stringify(req['query'])}
        window._datas_ = ${JSON.stringify(data)}
      `)
    res.header('Content-Type', 'text/html;charset=utf-8')
    res.end(html)
  }
}
