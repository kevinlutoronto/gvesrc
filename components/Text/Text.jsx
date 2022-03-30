// @flow
import React from 'react';
import cx from 'classnames';
import style from './style.scss';
import type { Data, StyleAttributes } from '../../types';
import { getDataAttrs } from '../../dataUtils';

export type Props = {|
  children: React$Node,
  data?: Data,
  large?: boolean,
  style?: StyleAttributes,
  type?: string,
|};

const types = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
};

class Text extends React.Component<Props> {
  static defaultProps = {
    style: { width: '200px', height: 'auto' },
  };

  render() {
    const { large, type } = this.props;
    const textStyle = cx(style.wrapper, {
      [style.large]: large,
      [style.primary]: type === types.PRIMARY,
      [style.secondary]: type === types.SECONDARY,
    });
    return (
      <div {...getDataAttrs(this.props.data)} className={textStyle} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}

Text.displayName = 'Plasma@Text';

export default Text;
