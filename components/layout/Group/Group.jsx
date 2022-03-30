// @flow
import React from 'react';
import cx from 'classnames';
import { map, isArray, toArray } from 'lodash';
import { getDataAttrs } from '../../../dataUtils';
import type { Data, StyleAttributes } from '../../../types';
import style from './style.scss';

type Props = {|
  children: React$Node,
  vertical?: boolean,
  layout: Array<Object>,
  style?: StyleAttributes,
  data?: Data,
|};

class Group extends React.Component<Props> {
  static defaultProps = {
    children: [],
    layout: [],
  };
  render() {
    const groupStyle = cx(style.wrapper, {
      [style.vertical]: this.props.vertical,
    });

    let children = this.props.children;
    if (!isArray(this.props.children)) {
      children = toArray(this.props.children);
    }

    return (
      <div {...getDataAttrs(this.props.data)} className={groupStyle} style={this.props.style}>
        {map(children, (child, index) => {
          const styleObj = {};
          if (this.props.layout[index] === 'shrink') {
            styleObj.flexShrink = '1';
          } else if (this.props.layout[index] === 'grow') {
            styleObj.flexGrow = '1';
          } else if (this.props.layout[index]) {
            styleObj.flexBasis = this.props.layout[index];
          } else {
            styleObj.flexBasis = `${100 / React.Children.count(this.props.children)}%`;
          }

          return (
            <div key={index} style={styleObj}>
              {child}
            </div>
          );
        })}
      </div>
    );
  }
}

Group.displayName = 'Plasma@Group';

export default Group;
