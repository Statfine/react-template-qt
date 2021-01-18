import React, { memo, useMemo } from 'react';

function FFunc() {
  const [count, setCuont] = React.useState(1); // eslint-disable-line
  const [name, setName] = React.useState('FFunc');
  console.log('in', 'FFunc');

  const handleChangeFunc = () => setName('FF');

  // const expensive = () => {
  //   console.log('compute');
  //   return count + 1;
  // }
  const expensive = useMemo(() => {
    console.log('compute');
    return count + 1;
  }, [count]);

  // const callback = () => {
  //   console.log(count);
  // }
  // const callback = useCallback(() => {
  //   console.log('callback', count);
  // }, [count]);
  // set.add(callback);

  return (
    <div>
      <p>{name}</p>
      <div onClick={handleChangeFunc}>Change FFunc</div>
      <p>{expensive}</p>
    </div>
  );
}

export default memo(FFunc);
