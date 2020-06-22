import {
  HomeOutlined,
} from '@ant-design/icons';

const path = '/dashboard';

/**
 *  type  single-单页面 list-子页面  
 *  name  页面标题
 *  url   页面路径
 *  icon  页面图标
 */
const ROOT = [
  {
    type: 'list',
    name: 'Tab1',
    url: `${path}/one`,
    icon: HomeOutlined,
    listUrl: [
      {
        name: 'Tab1-1',
        url: `${path}/one/one`,
      },
      {
        name: 'Tab1-2',
        url: `${path}/one/two`,
      },
      {
        name: 'Tab1-3',
        url: `${path}/one/three`,
      },
      {
        name: 'Tab1-4',
        url: `${path}/one/four`,
      },
    ],
  },
  {
    type: 'list',
    name: 'Tab2',
    url: `${path}/two`,
    icon: HomeOutlined,
    listUrl: [
      {
        name: 'Tab2-1',
        url: `${path}/two/one`,
      },
    ],
  },
  {
    type: 'single',
    name: '权限设置',
    url: `${path}/auth`,
    icon: HomeOutlined,
  },
  {
    type: 'single',
    name: '个人设置',
    url: `${path}/own`,
    icon: HomeOutlined,
  },
]

export default ROOT;
  