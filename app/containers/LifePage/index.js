import React from 'react';

import { SayName, Echarts, Emoji } from 'easub-ui-demo/lib';

import SonPage from './son';
import FFunc from './FFunc';
import UseState from './UseState';

export default class LifePage extends React.PureComponent {
  state = {
    name: 'hello word',
    user: {
      name: 'haha',
    },
  };

  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    console.log('F componentWillMount');
  }

  componentDidMount() {
    console.log('F componentDidMount');
  }

  handleChangeName = () => this.setState({ name: 'Hello' });

  render() {
    const { name } = this.state;
    console.log('F render');
    return (
      <div>
        <p>{this.state.user?.name}</p>
        {name}
        <div onClick={this.handleChangeName}>Change</div>
        <SonPage />
        <FFunc />
        <SayName />
        <UseState />
        <Emoji handleBack={v => console.log(v)} />
        <Echarts
          id="video"
          options={{
            title: {
              left: 'center',
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b} : {c} ({d}%)',
            },
            legend: {
              top: '10',
              left: '24',
              data: ['男', '女', '未知'],
            },
            series: [
              {
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                selectedMode: 'single',
                label: {
                  normal: {
                    show: true,
                    formatter: '{c}',
                  },
                },
                data: [
                  {
                    value: 45,
                    name: '男',
                    itemStyle: {
                      normal: {
                        color: '#1D9FFE',
                      },
                    },
                  },
                  {
                    value: 35,
                    name: '女',
                    itemStyle: {
                      normal: {
                        color: '#F06C83',
                      },
                    },
                  },
                  {
                    value: 20,
                    name: '未知',
                    itemStyle: {
                      normal: {
                        color: '#7585A2',
                      },
                    },
                  },
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                  },
                },
              },
            ],
          }}
        />
      </div>
    );
  }
}
