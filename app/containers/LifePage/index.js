import React from 'react';

import { SayName } from 'easub-ui/lib';

import SonPage from './son';
import FFunc from './FFunc';

export default class LifePage extends React.PureComponent {

  state = {
    name: "hello word"
  }

  UNSAFE_componentWillMount() { // eslint-disable-line
    console.log('F componentWillMount');
  }

  componentDidMount() {
    console.log('F componentDidMount');
  }

  handleChangeName = () => this.setState({ name: "Hello" });

  render() {
    const { name } = this.state;
    console.log('F render');
    return (
      <div>
        {name}
        <div onClick={this.handleChangeName}>Change</div>
        <SonPage />
        <FFunc />
        <SayName />
      </div>
    )
  }
}