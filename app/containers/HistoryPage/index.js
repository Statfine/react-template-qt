import React, { PureComponent } from 'react';

/**
 * 用于过滤参数重置浏览器url功能
*/
export default class HistoryPage extends PureComponent {

  // http://localhost:3080/params?errMsg=mag&filter=123
  componentDidMount() {
    const defaultQuery = this.getAllQuery(); //  获取所有参数
    if ('errMsg' in defaultQuery) alert(defaultQuery.errMsg);
    this.filterQuery(['errMsg']);
  }

  /**
   * 过滤query同时重置页面url
   *  filterList - 过滤数组['', '']
  */
  filterQuery = (filterList) => {
    const defaultQuery = this.getAllQuery(); //  获取所有参数
    const newQuery = Object.keys(defaultQuery)
      .filter((key) => defaultQuery[key] !== undefined && !filterList.includes(key))
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(defaultQuery[key])}`)
      .join('&');
    window.history.pushState({}, '', `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`); // 重组页面url
  }

  getAllQuery = () => {
    const query = window.location.search.substr(1).split('&')
    const params = {}
    for (let i = 0; i < query.length; i += 1) {
      const q = query[i].split('=')
      if (q.length === 2) {
        // eslint-disable-next-line prefer-destructuring
        params[q[0]] = q[1];
      }
    }
    return params  // 返回?号后面的参数名与参数值的数组
  }

  handleJump = () => {
    window.location.href = "/gaode";
  }

  render() {
    return (
      <div>
        <div onClick={this.handleJump}>Jump</div>
      </div>
    )
  }
}
