// 收集资源加载信息
const sourceType = ['link', 'script', 'img', 'css']

const getResource = () => {
  if (!window.performance) return
  const resourceList = window.performance.getEntriesByType('resource')
    .filter((wrapItem: any) => sourceType.findIndex((innerItem: any) => innerItem === wrapItem.initiatorType) > -1)
  const nowTime = Date.now()
  const resource = resourceList.map((item: any) => {
    return {
      time: nowTime,
      name: item.name,
      duration: Math.floor(item.duration || 0)
    }
  })

  return resource
}

export {
  getResource
}