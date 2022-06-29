// 收集性能信息
const getPerformance = () => {
  if (!window.performance) return
  const timing = window.performance.timing
  const performance = {
    // 性能统计的url
    path: window.location.href,
    // 白屏时间
    whiteScreen: timing.domLoading - timing.navigationStart,
    // DOM 渲染耗时
    dom: timing.domComplete - timing.domLoading,
    // 页面加载耗时
    load: timing.loadEventEnd - timing.navigationStart,
    // 获取性能信息时当前时间
    time: new Date().getTime(),
  }

  return performance
}

export {
  getPerformance
}