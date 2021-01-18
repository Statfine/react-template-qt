import React, { PureComponent } from 'react';

import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class EchartPage extends PureComponent {
  myChart;

  componentDidMount() {
    // 基于准备好的dom，初始化echarts实例
    this.myChart = echarts.init(document.getElementById('main'), 'light');
    // 绘制图表
    this.myChart.setOption({
      // title: {
      //   text: 'ECharts 入门示例',
      // },
      // tooltip: {},
      xAxis: {
        type: 'category',
        data: [
          '星期一',
          '星期二',
          '星期三',
          '星期四',
          '星期五',
          '星期六',
          '星期日',
        ],
      },
      yAxis: [
        {
          type: 'value',
          name: 'one',
          axisLabel: {
            formatter: '{value} 件',
          },
        },
        {
          type: 'value',
          name: 'two',
          axisLabel: {
            formatter: '{value} 件',
          },
        },
      ],
      series: [
        {
          name: 'one',
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true,
        },
        {
          name: 'two',
          data: [1, 10, 5, 8, 20, 12, 30],
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
        },
      ],
    });
  }

  render() {
    return (
      <div>
        <div id="main" style={{ width: 800, height: 800 }} />
      </div>
    );
  }
}
