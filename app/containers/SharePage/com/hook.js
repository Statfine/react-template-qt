import React, {
  memo,
  createRef,
  useCallback,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react';
import { Button } from 'antd';

import styled from 'styled-components';

const DivOne = styled.div`
  background: blue;
  width: 50px;
`;

const DivTwo = styled.div`
  background: green;
  padding: 10px;
  width: 100px;
`;

function AppendApi() {
  const oneRef = createRef();
  const twoRef = createRef();
  const [text, setText] = useState('hello');

  
  useEffect(() => {
    setText('word');
  }, []);
  useLayoutEffect(() => {
    console.log('useLayoutEffect');
  });

  // const handleAppendChange = useCallback(() => {
  //   const el = oneRef.current;
  //   twoRef.current.appendChild(el);
  // }, [oneRef]);

  const handleAppendChange = () => {
    const el = oneRef.current;
    twoRef.current.appendChild(el);
  };

  const handleAlert = useCallback(() => {
    alert(text);
  }, []);

  return (
    <div>
      <DivOne ref={oneRef}>{text}</DivOne>
      <DivTwo ref={twoRef}>two</DivTwo>
      <Button onClick={handleAppendChange}>Append</Button>
      <Button onClick={handleAlert}>alert</Button>
      <Button onClick={() => setText(Math.ceil(Math.random() * 10))}>
        change
      </Button>
    </div>
  );
}

export default memo(AppendApi);
