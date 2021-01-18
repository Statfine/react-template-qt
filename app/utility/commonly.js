/**
 * 常用方法
 */

//  获取url参数
export const getQueryString = name => {
  const regExp = `(^|&)${name}=([^&]*)(&|$)`;
  const reg = new RegExp(regExp, 'i');
  const r = window.location.search.substr(1).match(reg);
  try {
    if (r !== null) return decodeURIComponent(r[2]);
    return '';
  } catch (error) {
    return '';
  }
};
