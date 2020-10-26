import React from 'react';
import styled from 'styled-components';

import BacPng from './bac.png';

const Continar = styled.div`
  width: 100%;
  position: relative;
`;

const Content = styled.div`
  width: 100%;
  padding-top: 56.2%;
  background: red;
`;

const Div = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: red;
`;

export default class StylePage extends React.PureComponent {


  render() {
    return (
      <Continar>
        <Content></Content>
        <Div>
          <img src={BacPng} style={{ width: '100%', height: 'auto' }} alt="" />
        </Div>
      </Continar>
    )
  }
}