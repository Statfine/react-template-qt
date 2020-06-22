const { localStorage, location } = window;

// -----------------localStorage---------------------
// 设置localStorage
export function setLocal(key, val) {
  const setting = arguments[0]; // eslint-disable-line
  if (Object.prototype.toString.call(setting).slice(8, -1) === 'Object') {
    for (const i in setting) { // eslint-disable-line
      localStorage.setItem(i, setting[i]);
    }
  } else {
    localStorage.setItem(key, val);
  }
}

// 获取localStorage
export function getLocal(key) {
  try {
    if (key && localStorage.getItem(key) && localStorage.getItem(key) !== 'undefined') return localStorage.getItem(key)
    return null;
  } catch (error) {
    return null;
  }
}

// 移除localStorage
export function removeLocal(key) {
  localStorage.removeItem(key);
}

// 移除所有localStorage
export function clearLocal() {
  localStorage.clear();
}

// 删除app内localStorage，保留searchList
export function clearAppLocal() {
  removeLocal('refreshing_token');
  removeLocal('access_token');
  removeLocal('expires_in');
  removeLocal('refresh_token');
  removeLocal('y_uuid');
}

// 设置cookie
export function setCookie(name, value, expiredays = 7) {
  const expire = new Date();
  expire.setDate(expire.getDate() + expiredays);
  const domian = location.hostname;
  document.cookie = `${name}=${escape(value)};expires=${expire.toGMTString()};path=/;domain=${domian}`;
}

// 获取cookie
export function getCookie(name) {
  if (document.cookie.length > 0) {
    let start = document.cookie.indexOf(`${name}=`);
    if (start !== -1) {
      start = start + name.length + 1;
      let end = document.cookie.indexOf(';', start);
      if (end === -1) {
        end = document.cookie.length;
      }
      return unescape(document.cookie.substring(start, end));
    }
  }
  return '';
}

// 删除cookie
export function deleteCookie(name) {
  const expire = new Date();
  expire.setTime(-1000); // 设置时间
  const domian = location.hostname;
  document.cookie = `${name}=;expires=${expire.toGMTString()};path=/;domain=${domian}`;
}

// 删除cookie中所有
export function clearCookie() {
  const expire = new Date();
  expire.setTime(-1000); // 设置时间
  const data = document.cookie;
  const dataArray = data.split('; ');
  const domian = location.hostname;
  for (let i = 0; i < dataArray.length; i += 1) {
    const varName = dataArray[i].split('=');
    document.cookie = `${varName[0]}=;expires=${expire.toGMTString()};path=/;domain=${domian}`;
  }
}
