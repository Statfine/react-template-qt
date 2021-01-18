import React, { PureComponent } from 'react';
import { Table, Space } from 'antd';

// const { Column, ColumnGroup } = Table;

export default class AntdTable extends PureComponent {
  state = {
    selectedRowKeys: [],
  };

  render() {
    const dataSource = [
      {
        key: '1',
        name: '胡彦斌',
        age: 32,
        gender: '男',
        address: '西湖区湖底公园1号',
      },
      {
        key: '2',
        name: 'Disabled User',
        age: 42,
        gender: '男',
        address:
          '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号',
      },
      {
        key: '3',
        name: 'Disabled User3',
        age: 42,
        gender: '男',
        address:
          '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号',
      },
      {
        key: '4',
        name: 'Disabled User4',
        age: 42,
        gender: '女',
        address:
          '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号',
      },
      {
        key: '5',
        name: 'Disabled User5',
        age: 42,
        gender: '女',
        address:
          '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号',
      },
    ];
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        // colSpan: 2,
        render: (name, data, index) => {
          // colSpan行单元 小于4的行列正常显示，第四行占据4个单元，对应第四行其他单元应该设置成0不显示
          if (index < 4) {
            return (
              <div>
                {index},{name},{data.name}
              </div>
            );
          }
          return {
            children: (
              <div>
                {index},{name},{data.name}
              </div>
            ),
            props: {
              colSpan: 4,
            },
          };
        },
      },
      {
        title: '信息',
        children: [
          {
            title: '基本信息',
            children: [
              {
                title: '年龄',
                dataIndex: 'age',
                key: 'age',
                render: (age, data, index) => {
                  if (index === 1) {
                    return {
                      children: <div>{age}</div>,
                      props: {
                        rowSpan: 3,
                      },
                    };
                  }
                  if (index === 2 || index === 3) {
                    return {
                      children: <div>{age}</div>,
                      props: {
                        rowSpan: 0,
                      },
                    };
                  }
                  if (index < 4) {
                    return <div>{age}</div>;
                  }
                  return {
                    children: <div>{age}</div>,
                    props: {
                      colSpan: 0,
                    },
                  };
                },
              },
              {
                title: ' 性别',
                dataIndex: 'gender',
                key: 'gender',
                render: (gender, data, index) => {
                  if (index === 0) {
                    return {
                      children: <div>{gender}</div>,
                      props: {
                        rowSpan: 3,
                      },
                    };
                  }
                  if (index === 1 || index === 2) {
                    return {
                      children: <div>{gender}</div>,
                      props: {
                        rowSpan: 0,
                      },
                    };
                  }
                  return {
                    children: <div>{gender}</div>,
                  };
                },
              },
            ],
          },
          {
            title: '住址',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            render: (address, data, index) => {
              // rowSpan列单元 第2个列单元要占两个单元，对应第3行的这个单元应该设置成0不显示
              if (index === 2) {
                return {
                  children: <div>{address}</div>,
                  props: {
                    rowSpan: 2,
                  },
                };
              }
              if (index === 3) {
                return {
                  children: <div>{address}</div>,
                  props: {
                    rowSpan: 0,
                  },
                };
              }
              if (index < 4) {
                return <div>{address}</div>;
              }
              return {
                children: <div>{address}</div>,
                props: {
                  colSpan: 0,
                },
              };
            },
          },
        ],
      },
      {
        title: '操作',
        key: 'action',
        // render: (text, record, index) => (
        //   <Space size="middle">
        //     <p>Invite {record.name},{index}</p>
        //   </Space>
        // )
        render: (text, record, index) => {
          if (index < 4) {
            return (
              <Space size="middle">
                <p>
                  Invite {record.name},{index}
                </p>
              </Space>
            );
          }
          return {
            children: (
              <Space size="middle">
                <p>
                  Invite {record.name},{index}
                </p>
              </Space>
            ),
            props: {
              colSpan: 0,
            },
          };
        },
      },
    ];
    const { selectedRowKeys } = this.state;
    return (
      <>
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKey, selectedRows) => {
              // 事件
              console.log(
                `selectedRowKeys: ${selectedRowKey}`,
                'selectedRows: ',
                selectedRows,
              );
              this.setState({ selectedRowKeys: selectedRowKey });
            },
            selectedRowKeys,
            getCheckboxProps: record => ({
              // 属性设置
              disabled: record.name === 'Disabled User',
              name: record.name,
            }),
          }}
          dataSource={dataSource}
          columns={columns}
          expandable={{
            // 展开
            expandedRowRender: record => (
              <p style={{ margin: 0 }}>{record.address}</p>
            ),
            rowExpandable: record => record.name !== '胡彦斌',
          }}
          bordered
        />
      </>
    );
  }
}
