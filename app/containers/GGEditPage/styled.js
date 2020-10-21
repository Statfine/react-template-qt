import styled from 'styled-components';

export const ItemDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 ;
`;

export const CircleItemDiv = styled.div`
  width: 60px;
  height: 60px;
  line-height: ${({ flag }) => `${flag === 'end' ? '48px' : '54px'}`};
  text-align: center;
  border-radius: 50%;
  border: ${({ flag }) => `${flag === 'end' ? '6px' : '3px'} solid #000`};
  color: #000;
  cursor: move;
`;

export const TaskItemDiv = styled.div`
  width: 100px;
  height: 60px;
  border: 2px solid #000;
  text-align: left;
  padding: 2px 0 0 8px;
  color: #000;
`;

export const DiamondItemDiv = styled.div`
  width: 60px;
  height: 60px;
  border: 2px solid #000;
  transform:rotate(45deg);
  -ms-transform:rotate(45deg);
  -moz-transform:rotate(45deg);
  -webkit-transform:rotate(45deg);
  -o-transform:rotate(45deg);
  > p {
    transform:rotate(-45deg);
  }
`;
