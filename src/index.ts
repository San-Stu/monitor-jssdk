import { getPerformance } from './performance'
import { getResource } from './resource'
import { getNavigator } from './_navigator'
import qs from 'qs'

declare const window: Window & {
  requestIdleCallback: any,
  addHistoryListener: any,
  history: any,
  XMLHttpRequest: any,
  JYMonitor: any
};

const waitIdle = (fn: Function) => {
  // 在浏览器空闲时间获取性能及资源信息
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback 
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      return fn()
    })
  } else {
    setTimeout(() => {
      return fn()
    }, 0)
  }
}

const baseUrl = 'https://sanstu.com/api/collect'
const uploadByGif = (url: string, data: object) => {
  data = {
    ...data,
    ...JYMonitor.navigator,
    projectKey: JYMonitor.projectKey
  }
  const imgSrc = `${baseUrl}${url}?${qs.stringify(data)}`
  let img: any = new Image()
  img.onload = img.onerror = () => {
    img = null
  };
  img.src = imgSrc
}

const uploadByBeacon = (url: string, source: any) => {
  source = {
    source,
    ...JYMonitor.navigator,
    projectKey: JYMonitor.projectKey
  }
  navigator.sendBeacon(`${baseUrl}${url}`, JSON.stringify(source))
}

interface Params {
  projectKey: string
}

class JYMonitor {
  static navigator: any;
  static projectKey: string;
  static logError: Function;
  performance: any;
  constructor({ projectKey }: Params) {
    JYMonitor.navigator = getNavigator()
    JYMonitor.projectKey = projectKey
    JYMonitor.logError = this.logError
    this.performance = {}
    this._initRouterEach()
    this.listenError()
    this.xhrReplace()
    this._initOnLoad()
    this._initBeforeUnload()
  }

  private xhrReplace () {
    if (!window.XMLHttpRequest) return
    const xmlhttp = window.XMLHttpRequest
    const _oldSend = xmlhttp.prototype.send
    const _oldSetRequestHeader = xmlhttp.prototype.setRequestHeader
    let startTime = 0
    const _handleEvent = (event: any) => {
      if (event && event.currentTarget) {
        const currentTarget = event.currentTarget
        const log: any = {
          code: 0,
          path: currentTarget.responseURL,
          time: Date.now(),
          duration: Date.now() - startTime
        }
        if (currentTarget.status !== 200) {
          // 自定义错误上报
          log.code = -1
          log.page = window.location.href
          log.status = currentTarget.status
          log.statusText = currentTarget.statusText
          log.responseText = currentTarget.responseText
        }
        // 未报错并且未获取到耗时接口不上报，非悦跑圈接口
        if (log.path.indexOf('joyrun') === -1 || (log.code === 0 && log.duration === 0)) {
          return
        }
        // 上报
        this.logXhr(log)
      }
    }

    xmlhttp.prototype.setRequestHeader = function (header: any, value: any) {
      if (!this.reqHeaders) {
        this.reqHeaders = {}
      }
      this.reqHeaders[header] = value

      return _oldSetRequestHeader.apply(this, arguments)
    }
    xmlhttp.prototype.send = function (e: any) {
      startTime = Date.now()
      if (this['addEventListener']) {
        this['addEventListener']('error', _handleEvent)
        this['addEventListener']('load', _handleEvent)
        this['addEventListener']('abort', _handleEvent)
      } else {
        const _oldStateChange = this['onreadystatechange']
        this['onreadystatechange'] = function (event: any) {
          if (this.readyState === 4) {
            _handleEvent(event)
          }
          _oldStateChange && _oldStateChange.apply(this, arguments)
        };
      }
      return _oldSend.apply(this, arguments)
    }
  }

  private listenError () {
    // js运行错误
    window.onerror = (msg, url, row, col, error: any) => {
      this.logError({
        type: 'javascript',
        msg,
        path: url,
        row,
        col,
        errorMsg: error.stack,
        page: window.location.href,
        time: Date.now()
      })
      return true
    }
    // promise错误
    window.addEventListener('unhandledrejection', (e: any) => {
      this.logError({
        type: 'promise',
        msg: e.reason.message,
        errorMsg: e.reason.stack,
        page: window.location.href,
        time: Date.now()
      })
    })
    // 资源错误
    window.addEventListener('error', (e: any) => {
      const target = e.target
      if (target.localName) {
        this.logError({
          type: 'resource',
          targetType: target.localName,
          path: e.target.src || e.target.href,
          time: Date.now()
        })
      }
    }, true)
  }

  private _initOnLoad () {
    window.onload = () => {
      waitIdle(() => {
        this.performance = getPerformance()
        this.logPer()
      })
    }
  }

  private _initBeforeUnload () {
    window.onbeforeunload = () => {
      this.logSource(getResource())
    }
  }

  private _initRouterEach () {
    const _oldSend = window.history.replaceState
    window.history.replaceState = function () {
      const e: any = new Event('replaceState')
      e.arguments = arguments
      window.dispatchEvent(e)
      return _oldSend.apply(this, arguments)
    }
    // 监听路由跳转
    window.addEventListener('replaceState', () => {
      setTimeout(() => {
        this.logPV({
          time: Date.now(),
          path: window.location.href
        })
      }, 0)
    })
    // 监听前进、后退
    window.onpopstate = () => {
      this.logPV({
        time: Date.now(),
        path: window.location.href
      })
    }
  }

  logPV (log: object) {
    // console.log('pv:', log)
    waitIdle(() => uploadByGif('/pv.gif', log))
  }

  logXhr (log: any) {
    // console.log('接口:', log)
    waitIdle(() => uploadByGif('/xhr.gif', log))
  }

  logPer () {
    // console.log('性能:', this.performance)
    waitIdle(() => uploadByGif('/per.gif', {
      ...this.performance,
      isFPage: true
    }))
  }

  logSource (source: any) {
    // console.log(source)
    uploadByBeacon('/source', source)
  }

  logError (log: any) {
    if (log.type === 'custom') {
      log = {
        ...log,
        page: window.location.href,
        time: Date.now()
      }
    }
    // console.log('error:', log)
    waitIdle(() => uploadByGif('/error.gif', log))
  }

}

window.JYMonitor = JYMonitor
