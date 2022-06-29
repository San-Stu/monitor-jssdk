import MobileDetect from 'mobile-detect'

const getBrowser = () => {
  const UserAgent: any = navigator.userAgent.toLowerCase()
  const browserInfo: any = {}
  const browserArray: any = {
    IE: window.ActiveXObject || "ActiveXObject" in window, // IE
    Chrome: UserAgent.indexOf('chrome') > -1 && UserAgent.indexOf('safari') > -1, // Chrome浏览器
    Firefox: UserAgent.indexOf('firefox') > -1, // 火狐浏览器
    Opera: UserAgent.indexOf('opera') > -1, // Opera浏览器
    Safari: UserAgent.indexOf('safari') > -1 && UserAgent.indexOf('chrome') == -1, // safari浏览器
    Edge: UserAgent.indexOf('edge') > -1, // Edge浏览器
    QQBrowser: /qqbrowser/.test(UserAgent), // qq浏览器
    WeixinBrowser: /MicroMessenger/i.test(UserAgent) // 微信浏览器
  };
  for (let i in browserArray) {
    if (browserArray[i]) {
      var versions = ''
      if (i == 'IE') {
        versions = UserAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)[2]
      } else if (i == 'Chrome') {
        for (var mt in navigator.mimeTypes) {
          //检测是否是360浏览器(测试只有pc端的360才起作用)
          if (navigator.mimeTypes[mt]['type'] == 'application/360softmgrplugin') {
            i = '360'
          }
        }
        versions = UserAgent.match(/chrome\/([\d.]+)/)[1]
      } else if (i == 'Firefox') {
        versions = UserAgent.match(/firefox\/([\d.]+)/)[1]
      } else if (i == 'Opera') {
        versions = UserAgent.match(/opera\/([\d.]+)/)[1]
      } else if (i == 'Safari') {
        versions = UserAgent.match(/version\/([\d.]+)/)[1]
      } else if (i == 'Edge') {
        versions = UserAgent.match(/edge\/([\d.]+)/)[1]
      } else if (i == 'QQBrowser') {
        versions = UserAgent.match(/qqbrowser\/([\d.]+)/)[1]
      }
      browserInfo.type = i
      browserInfo.versions = parseInt(versions)
    }
  }
  if (!Object.keys(browserInfo).length) {
    browserInfo.type = 'Chrome'
  }
  return browserInfo;
}

const getNavigator = () => {
  if (!window.navigator) return
  const md = new MobileDetect(window.navigator.userAgent)
  const browserInfo = getBrowser()
  const ypcookie = ($ as any).cookie('ypcookie')
  const uid = ypcookie ? ypcookie.split('&')[0].split('=')[1] : ''
  // ip服务端获取
  const navigator: any = {
    appVersion: ($ as any).cookie('app_version') || '',
    uid,
    browser: browserInfo.type,
    browserVersion: browserInfo.versions || ''
  }

  const os = md.os()
  navigator._os = os
  if (os === 'iOS') {
    navigator.osVersion = md.version('iPhone')
  } else if (os == "AndroidOS") {
    navigator.osVersion = md.version('Android')
  }
  return navigator
}

export {
  getNavigator
}