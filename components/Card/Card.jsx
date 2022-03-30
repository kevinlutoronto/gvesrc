// @flow
import cx from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import { getDataAttrs } from '../../dataUtils';
import type { Data } from '../../types';
import style from './style.scss';

import Header from '../Header/Header';

const cardTypes = {
  REGULAR: 'regular',
  CONDENSED: 'condensed',
};
const borderTypes = { DASHED: 'dashed' };
export const borderColors = { RED: 'red' };

type Props = {|
  title?: string,
  actions?: Array<Object>,
  children?: React$Node,
  type?: $Values<typeof cardTypes>,
  onClick?: (evt: MouseEvent) => void,
  borderType?: string,
  borderColor?: $Values<typeof borderColors>,
  expandedComponent?: React$Node,
  isExpanded?: boolean,
  minWidth?: number,
  data?: Data,
|};

type State = {|
  defaultHeight?: number,
  expandedHeight?: number,
  isMounted: boolean,
|};

class Card extends React.Component<Props, State> {
  expanded: ?Object;

  outer: ?Element;

  default: ?Object;

  constructor() {
    super();
    this.state = {
      isMounted: false,
    };
  }

  /**
   * TODO: remove the use of react-dom here as it is not needed for refs
   */
  componentDidMount() {
    /* eslint-disable */
    if (this.props.expandedComponent) {
      const defaultEl = ReactDOM.findDOMNode(this.default); //$FlowFixMe
      const defaultHeight = defaultEl.offsetHeight;
      const expandedEl = ReactDOM.findDOMNode(this.expanded); //$FlowFixMe
      const expandedHeight = expandedEl.offsetHeight;
      this.setState({ defaultHeight, expandedHeight });
    }
    this.setState({ isMounted: true });
    /* eslint-enable */
  }

  render() {
    const {
      title,
      actions,
      children,
      expandedComponent,
      onClick,
      data,
      isExpanded,
      borderType,
      borderColor,
      type,
      minWidth,
    } = this.props;

    const cardStyle = cx(style.card, {
      [style.condensed]: type === cardTypes.CONDENSED,
      [style.borderDashed]: borderType === borderTypes.DASHED,
      [style.borderRed]: borderColor === borderColors.RED,
      [style.isExpanded]: isExpanded,
    });

    let defaultHeight = 'auto';
    let expandedHeight = 'auto';

    if (this.state.isMounted) {
      if (this.props.isExpanded) {
        defaultHeight = 0;
        // eslint-disable-next-line prefer-destructuring
        expandedHeight = this.state.expandedHeight;
      } else {
        // eslint-disable-next-line prefer-destructuring
        defaultHeight = this.state.defaultHeight;
        expandedHeight = 0;
      }
    }

    return (
      <div
        ref={c => {
          this.outer = c;
        }}
        className={cardStyle}
        style={{ minWidth }}
        onClick={onClick}
        {...getDataAttrs(data)}
      >
        <div className={style.inner}>
          {(title || actions) && (
            <div className={style.top}>
              {title && <Header h4>{title}</Header>}
              {actions && <div className={style.cardActions}>{actions.map(action => action)}</div>}
            </div>
          )}
          <div
            ref={c => {
              this.default = c;
            }}
            className={style.default}
            style={{ maxHeight: defaultHeight }}
          >
            {children}
          </div>
          {expandedComponent && (
            <div
              ref={c => {
                this.expanded = c;
              }}
              className={style.expanded}
              style={{ maxHeight: expandedHeight }}
            >
              {expandedComponent}
            </div>
          )}
        </div>
      </div>
    );
  }
}

Card.displayName = 'Plasma@Card';

export default Card;
