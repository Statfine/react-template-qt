/**
 * 页面滚动监听
 * regWindowScroll 避免单页应用  window.onscroll 多出注册污染
 * removeWindowScrollHandler 移除
 * scrollTop 获取页面顶部被卷起来的高度
 * documentHeight 获取页面文档的总高度
 * windowHeight 获取页面浏览器视口的高度
 * 
 * scrollWindow 滚动到指定位置
 */

// 页面滚动事件监听
function regWindowScroll(myHandler) {
  if (window.onscroll === null) {
    window.onscroll = myHandler;
  } else if (typeof window.onscroll === 'function') {
    window.onscroll = '';
    window.onscroll = myHandler;
  }
}

function removeWindowScrollHandler() {
  window.onscroll = '';
}

// 获取页面顶部被卷起来的高度
function scrollTop() {
  return Math.max(document.body.scrollTop,document.documentElement.scrollTop);
}

// 获取页面文档的总高度
function documentHeight() {
  return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

// 获取页面浏览器视口的高度
function windowHeight() {
  // document.compatMode有两个取值。BackCompat：标准兼容模式关闭。CSS1Compat：标准兼容模式开启。
  return (document.compatMode === 'CSS1Compat') ? document.documentElement.clientHeight : document.body.clientHeight;
}

function isBottom(hasFooter = true) {
  const footerHeight = hasFooter ? 188 : 0;
  return scrollTop() + windowHeight() >= (documentHeight() - footerHeight);
}

// 滚动到指定位置
function scrollWindow(position = 0, time = 0) {
  if (!time) {
    document.body.scrollTop = position;
    document.documentElement.scrollTop = position;
  }
  const spacingTime = 20; // 设置循环的间隔时间  值越小消耗性能越高
  let spacingInex = time / spacingTime; // 计算循环的次数
  let nowTop = document.body.scrollTop + document.documentElement.scrollTop; // 获取当前滚动条位置
  const everTop = (position - nowTop) / spacingInex; // 计算每次滑动的距离
  const scrollTimer = setInterval(() => {
    if (spacingInex > 0) {
      spacingInex--; // eslint-disable-line
      scrollWindow(nowTop += everTop);
    } else {
      clearInterval(scrollTimer); // 清除计时器
    }
  }, spacingTime);
};

export {
  regWindowScroll,
  removeWindowScrollHandler,
  scrollTop,
  documentHeight,
  windowHeight,
  isBottom,
  scrollWindow,
};
