// @flow
import React, { Component } from 'react';
import style from './oldStyle.scss';

type Props = {|
  children: React$Node,
|};

class SideNavBar extends Component<Props> {
  render() {
    return <div className={style.wrapper}>{this.props.children}</div>;
  }
}

SideNavBar.displayName = 'Plasma@SideNavBar';

export default SideNavBar;
