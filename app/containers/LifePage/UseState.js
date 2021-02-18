/*
 * @Description:
 * @Author: shaojia
 * @Date: 2021-01-22 11:31:34
 * @LastEditTime: 2021-01-22 19:30:31
 * @LastEditors: shaojia
 */
import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';

const Son = memo(props => {
  const addItem = props.addItem;
  useEffect(() => {
    console.log('子组件ListItem 加载');
  }, []);
  useEffect(() => {
    console.log('子组件render');
  });
  return <div onClick={addItem}> {props.children} </div>;
});

Son.propTypes = {
  addItem: PropTypes.func,
  children: PropTypes.node,
};

function UseStateTest() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('hello');
  const [list, setList] = useState(['6点起床', '7点上班', '8点早会']);

  const fetch = () => {
    console.log('fetch', count);
  };

  // 需要子组件memo配合useCallback一起使用
  const handleCallBack = useCallback(() => {
    console.log('handleCallBack');
    list.push(`行程 ${count}`);
    setList([...list]);
  }, [count, list]);

  const maxCount = useMemo(() => {
    console.log('useMemo');
    return count + 1;
  }, [count]);

  return (
    <>
      <div>~~~~~~~~~~~~~~~~~</div>
      <div>count:{count}</div>
      <div>maxCount:{maxCount}</div>
      <Button
        onClick={() => {
          setCount(count + 1);
          fetch();
        }}
      >
        +
      </Button>
      {list.map(item => (
        <Son key={item} addItem={handleCallBack}>
          {item}
        </Son>
      ))}
      <Button
        onClick={() => {
          setName(name === 'hello' ? 'word' : 'hello');
        }}
      >
        修改{name}
      </Button>
      <Son onSubmit={handleCallBack} />
    </>
  );
}

export default memo(UseStateTest);
