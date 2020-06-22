/**
 * 驼峰 下划线  相互转换
 */
import _ from 'lodash'

function mapKeysDeep (obj, func) {
  const defalutObj = obj;
  const keys = Object.keys(defalutObj)
  keys.forEach(key => {
    if (_.isObject(obj[key])) {
      const value = mapKeysDeep(obj[key], func)
      delete defalutObj[key]
      defalutObj[func(key)] = value
    } else {
      const value = obj[key]
      delete defalutObj[key]
      defalutObj[func(key)] = value
    }
  })
  return defalutObj
}

// 驼峰转下划线
export function camelToSnake (obj) {
  return mapKeysDeep(obj, _.snakeCase)
}

// 下划线转驼峰
export function camelCase (obj) {
  return mapKeysDeep(obj, _.camelCase)
}
