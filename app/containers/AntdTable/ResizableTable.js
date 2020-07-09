import React, { PureComponent } from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import { Resizable } from 'react-resizable';
import './style.css';

const ResizableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};


ResizableTitle.propTypes = {
  onResize: PropTypes.func,
  width: PropTypes.any,
}

export default class Demo extends PureComponent {
  state = {
    columns: [
      {
        title: 'Date',
        dataIndex: 'date',
        width: 200,
      },
      {
        title: '信息',
        children: [
          {
            title: 'Amount',
            dataIndex: 'amount',
            width: 100,
            sorter: (a, b) => a.amount - b.amount,
          },
          {
            title: 'Type',
            dataIndex: 'type',
            width: 100,
          }
        ]
      },
      {
        title: 'Note',
        dataIndex: 'note',
        width: 100,
      },
      {
        title: 'Action',
        key: 'action',
        render: () => <div>Delete</div>,
      },
    ],
  };

  components = {
    header: {
      cell: ResizableTitle,
    },
  };

  data = [
    {
      key: 0,
      date: '2018-02-11',
      amount: 120,
      type: 'income',
      note: 'transfer',
    },
    {
      key: 1,
      date: '2018-03-11',
      amount: 243,
      type: 'income',
      note: 'transfer',
    },
    {
      key: 2,
      date: '2018-04-11',
      amount: 98,
      type: 'income',
      note: 'transfer',
    },
  ];

  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };

  render() {
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));

    return <Table bordered components={this.components} columns={columns} dataSource={this.data} />;
  }
}