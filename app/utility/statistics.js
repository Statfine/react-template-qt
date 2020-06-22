// 点击事件
function eventsStatistics(eventsName, params = {}) {
  const defaultParam = {
    time: Math.round(new Date().getTime() / 1000).toString(),
    user_id: !localStorage.y_uuid ? '' : localStorage.y_uuid,
  };
  // eslint-disable-next-line no-undef
  sa.track(eventsName, { ...defaultParam, ...params });
}

export { eventsStatistics };
