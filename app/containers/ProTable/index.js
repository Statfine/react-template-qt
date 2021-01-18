/* eslint-disable camelcase */
import React from 'react';
import { Table } from 'antd';

export default function () {
  const columns = geneColumn();
  const data = geneData();
  // group
  const groupConfig = [
    {
      $class: 'groupConfig',
      groupDirection: 'rowSpan',
      groupKey: 'level',
    },
    {
      $class: 'groupConfig',
      groupDirection: 'rowSpan',
      groupKey: 'type-cpz',
    },
  ];
  groupConfig.forEach(config => {
    const result = [];
    let cacheVal = null;
    for (let i = 0, len = data.length; i < len; i += 1) {
      const dataItem = data[i];
      if (!cacheVal || cacheVal.val !== dataItem[config.groupKey]) {
        cacheVal = {
          val: dataItem[config.groupKey],
          start: i,
          end: i,
        };
        result.push(cacheVal);
      } else {
        cacheVal.end = i;
      }
    }
    const tobeConfigColumn = columns.find(
      column => column.dataIndex === config.groupKey,
    );
    if (tobeConfigColumn) {
      tobeConfigColumn.render = (value, record, currentIndex) => {
        const exist = result.find(item => item.start === currentIndex);
        return {
          children: value,
          props: {
            [config.groupDirection]: exist ? exist.end - exist.start + 1 : 0,
          },
        };
      };
    }
  });
  return (
    <Table
      pagination={false}
      columns={columns}
      dataSource={data}
      bordered
      size="middle"
      scroll={{ x: 'calc(700px + 50%)' }}
    />
  );
}

function geneColumn() {
  const levelColumn = {
    title: '产品等级',
    dataIndex: 'level',
  };
  const typeAllColumn = {
    title: '品类/畅平滞',
    dataIndex: 'type-cpz',
  };
  const test_periodColumn = {
    title: '测新期',
    dataIndex: 'test-period',
  };
  const c_30_column = {
    title: '畅',
    dataIndex: 'c_30',
  };
  const p_30_column = {
    title: '平',
    dataIndex: 'p_30',
  };
  const z_30_column = {
    title: '滞',
    dataIndex: 'z_30',
  };
  const c_90_column = {
    title: '畅',
    dataIndex: 'c_90',
  };
  const p_90_column = {
    title: '平',
    dataIndex: 'p_90',
  };
  const z_90_column = {
    title: '滞',
    dataIndex: 'z_90',
  };
  const c_120_column = {
    title: '畅',
    dataIndex: 'c_120',
  };
  const p_120_column = {
    title: '平',
    dataIndex: 'p_120',
  };
  const z_120_column = {
    title: '滞',
    dataIndex: 'z_120',
  };

  return [
    levelColumn,
    {
      title: '畅销周期',
      children: [typeAllColumn],
    },
    {
      title: '上市～30天',
      children: [test_periodColumn],
    },
    {
      title: '上市～31-90天',
      children: [c_30_column, p_30_column, z_30_column],
    },
    {
      title: '上市～91-180天',
      children: [c_90_column, p_90_column, z_90_column],
    },
    {
      title: '上市～1801天',
      children: [c_120_column, p_120_column, z_120_column],
    },
  ];
}

function geneData() {
  return [
    { level: '重点款', 'type-cpz': '单空凉' },
    { level: '重点款', 'type-cpz': '矮/中靴' },
    { level: '重点款', 'type-cpz': '高/超高靴' },
    { level: '常销款', 'type-cpz': '单空凉' },
    { level: '常销款', 'type-cpz': '矮/中靴' },
    { level: '常销款', 'type-cpz': '高/超高靴' },
    { level: '策略款', 'type-cpz': '单空凉' },
    { level: '策略款', 'type-cpz': '矮/中靴' },
    { level: '策略款', 'type-cpz': '高/超高靴' },
    { level: '形象款', 'type-cpz': '高/超高靴' },
    { level: '有效旧品', 'type-cpz': '单空凉' },
    { level: '有效旧品', 'type-cpz': '矮/中靴' },
    { level: '有效旧品', 'type-cpz': '高/超高靴' },
    { level: '清货款', 'type-cpz': '单空凉' },
    { level: '清货款', 'type-cpz': '矮/中靴' },
    { level: '清货款', 'type-cpz': '高/超高靴' },
  ];
}
