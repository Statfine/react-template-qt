/**
 * Created by easub on 2017/1/11.
 */
const Tool = {
  /*
   *  字符串转时间格式分钟:秒
   *  01:54
   */
  stringToMinSec(timeLength) {
    // const Ttime = parseInt(Math.ceil(timeLength));
    const Ttime = parseInt(timeLength);
    let min;
    let sec;

    if (Ttime < 60) {
      min = '00';
      sec = Ttime < 10 ? `0${Ttime}` : Ttime;
    } else if (Ttime === 60) {
      min = '01';
      sec = '00';
    } else if (Ttime > 60 && Ttime < 3600) {
      const timeMin = parseInt(Ttime / 60);
      const timeS = parseInt(Ttime % 60);
      min = timeMin < 10 ? `0${timeMin}` : timeMin;
      sec = timeS < 10 ? `0${timeS}` : timeS;
      return `${min}:${sec}`;
    } else {
      const timeHour = parseInt(Ttime / 3600);
      const timeMins = parseInt((Ttime % 3600) / 60);
      const timeS = parseInt((Ttime % 3600) % 60);
      const hour = timeHour < 10 ? `0${timeHour}` : timeHour;
      min = timeMins < 10 ? `0${timeMins}` : timeMins;
      sec = timeS < 10 ? `0${timeS}` : timeS;
      return `${hour}:${min}:${sec}`;
    }
    return `${min}:${sec}`;
  },

  /*
   *  时间戳(13位)转换 月-日 小时:分之
   *  09-01 24:01
   */
  dataMonthDayHoursMin(time, flag) {
    const setData = new Date(time);
    let month = setData.getMonth() + 1;
    month = this.zeroFill(month);
    let day = setData.getDate();
    day = this.zeroFill(day);
    let hours = setData.getHours();
    hours = this.zeroFill(hours);
    let min = setData.getMinutes();
    min = this.zeroFill(min);
    let sec = setData.getSeconds();
    sec = this.zeroFill(sec);
    if (flag) return `${month}-${day} ${hours}:${min}:${sec}`;
    return `${month}-${day} ${hours}:${min}`;
  },

  getQueryString(name) {
    const regExp = `(^|&)${name}=([^&]*)(&|$)`;
    const reg = new RegExp(regExp, 'i');
    const r = window.location.search.substr(1).match(reg);
    try {
      if (r !== null) return decodeURIComponent(r[2]);
      return null;
    } catch (error) {
      return null;
    }
  },

  /*
   *  时间戳转换 年：月：日
   *  2017年12月25日
   */

  dataYearMonthDay(time) {
    const setData = new Date(time * 1000);
    const year = setData.getFullYear();
    let month = setData.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = setData.getDate();
    day = day < 10 ? `0${day}` : day;
    return `${year}年${month}月${day}日`;
  },

  dataYearMonthDayByType(time, type) {
    const setData = new Date(time * 1000);
    const year = setData.getFullYear();
    let month = setData.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = setData.getDate();
    day = day < 10 ? `0${day}` : day;
    return `${year}${type}${month}${type}${day}`;
  },

  /*
   *  字符串转时间格式 分钟:秒
   *  01:54.12
   */
  formatTime(t) {
    const m = parseInt(t / 60);
    const s = Number(t - m * 60).toFixed(2);
    return `${this.zeroFill(m)}:${this.zeroFill(s)}`;
  },

  /*
   *  前后日期转时间格式 年：月：日 时:分:秒
   *  gj
   */
  changeDate(timeStamp, start) {
    const date = new Date(timeStamp);
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 >= 10
        ? date.getMonth() + 1
        : `0${date.getMonth() + 1}`;
    const day = date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`;
    if (start) {
      return `${year}-${month}-${day} 00:00:01`;
    }
    return `${year}-${month}-${day} 23:59:59`;
  },

  /*
   *  字符串转时间格式 年：月：日 时:分
   *  01:54.12
   */
  getFullTime(params) {
    const time = new Date(params);
    const y = time.getFullYear();
    const m = time.getMonth() + 1;
    const newM = m < 10 ? `0${m}` : m;
    const d = time.getDate();
    const newD = d < 10 ? `0${d}` : d;
    const h = time.getHours();
    const newH = h < 10 ? `0${h}` : h;
    const mm = time.getMinutes();
    const newMM = mm < 10 ? `0${mm}` : mm;
    const s = time.getSeconds();
    const newS = s < 10 ? `0${s}` : s;
    return `${y}-${newM}-${newD} ${newH}:${newMM}:${newS}`;
  },

  formatTimeNoMinsec(t) {
    const m = parseInt(t / 60);
    const s = parseInt(t - m * 60);
    return `${this.zeroFill(m)}:${this.zeroFill(s)}`;
  },

  formatHourMinSec(t) {
    const h = parseInt(t / 3600);
    const m = parseInt((t - h * 3600) / 60);
    const s = parseInt(t - (h * 3600 + m * 60));
    return `${this.zeroFill(h)}:${this.zeroFill(m)}:${this.zeroFill(s)}`;
  },

  zeroFill(s) {
    if (s < 10 && s >= 0) return `0${s}`;
    return s;
  },

  cutStr(str) {
    const b = parseInt(str).toString();
    const len = b.length;
    if (len <= 3) return b;
    const r = len % 3;
    return r > 0
      ? `${b.slice(0, r)},${b
        .slice(r, len)
        .match(/\d{3}/g)
        .join(',')}`
      : b
        .slice(r, len)
        .match(/\d{3}/g)
        .join(',');
  },

  getLength(q, gg) {
    let sum;
    const g = gg || {};
    g.max = g.max || 140;
    g.min = g.min || 41;
    g.surl = g.surl || 20;
    const p = this.lengthTrim(q).length;
    if (p > 0) {
      const j = g.min;
      const s = g.max;
      const b = g.surl;
      let n = q;
      const r =
        q.match(
          // eslint-disable-next-line
          /(http|https):\/\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+([-A-Z0-9a-z\$\.\+\!\_\*\(\)\/\,\:;@&=\?~#%]*)*/gi,
        ) || [];
      let h = 0;
      for (let m = 0, len = r.length; m < len; m += 1) {
        const o = this.byteLength(r[m]);
        if (!/^(http:\/\/t.cn)/.test(r[m])) {
          const reTwo = /^(http:\/\/)+(weibo.com|weibo.cn)/;
          if (reTwo.test(r[m])) {
            const ternary = o <= s ? b : o - s + b;
            h += o <= j ? o : ternary;
          } else {
            h += o <= s ? b : o - s + b;
          }
        }
        n = n.replace(r[m], '');
      }
      sum = Math.ceil((h + this.byteLength(n)) / 2);
    } else {
      sum = 0;
    }
    return sum;
  },

  lengthTrim(h) {
    try {
      return h.replace(/^\s+|\s+$/g, '');
    } catch (j) {
      return h;
    }
  },

  byteLength(b) {
    if (typeof b === 'undefined') {
      return 0;
    }
    // eslint-disable-next-line no-control-regex
    const a = b.match(/[^\x00-\x80]/g);
    return b.length + (!a ? 0 : a.length);
  },

  // 字节转换
  sizeTransform(length) {
    const limit = Number(length);
    let size = '';
    if (limit < 0.1 * 1024) size = `${limit.toFixed(2)}B`;
    // 小于0.1KB，则转化成B
    else if (limit < 0.1 * 1024 * 1024) size = `${(limit / 1024).toFixed(2)}KB`;
    // 小于0.1MB，则转化成KB
    else if (limit < 0.1 * 1024 * 1024 * 1024)
      size = `${(limit / (1024 * 1024)).toFixed(2)}MB`;
    // 小于0.1GB，则转化成MB
    else size = `${(limit / (1024 * 1024 * 1024)).toFixed(2)}GB`; // 其他转化成GB
    const sizeStr = size.toString(); // 转成字符串
    const index = sizeStr.indexOf('.'); // 获取小数点处的索引
    const dou = sizeStr.substr(index + 1, 2); // 获取小数点后两位的值
    if (dou === '00')
      return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2); // 判断后两位是否为00，如果是则删除00
    return size;
  },
};

export { Tool };
