import Starter from '@pefish/js-util-starter'
import ConfigUtil from '@pefish/js-util-config'
import HttpServerHelper from '../../src/http_server'
import Log4js from '@pefish/js-helper-logger/lib/log4js'
import path from 'path'

process.on('SIGINT', async () => {
  await exit()
})

async function clean() {
  try {

  } catch (err) {
    // logger.error(err)
  }

  global.logger.info(`应用已经清理`)
}

async function exit() {
  await clean()
  process.exit(0)
}

Starter.startAsync(async () => {
  const config = ConfigUtil.loadJsonConfig()
  global['config'] = config
  global['debug'] = config[`env`] !== 'prod'
  global['logger'] = new Log4js(`test`)
  const httpServer = new HttpServerHelper(config['host'], config['port'])
  await httpServer.listen(
    path.join(__dirname, './routes'),
    path.join(__dirname, './controllers')
  )
})


