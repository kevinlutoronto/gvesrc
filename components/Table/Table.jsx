// @flow
import { pick, keys, forEach, get, map, includes, isEqual, find } from 'lodash';
import React from 'react';
import cx from 'classnames';
import { getDataAttrs } from '../../dataUtils';
import type { Data, StyleAttributes } from '../../types';
import Icon from '../Icon/Icon';
import upArrow from '../../icons/upArrow';
import downArrow from '../../icons/downArrow';
import style from './style.scss';

type Props = {|
  clickable?: boolean,
  empty: boolean,
  emptyText: React$Node,
  headerData: Array<Object>,
  highlightable?: boolean,
  items: ?Array<Object>,
  loading: boolean,
  onSort?: string => void,
  selectedColumnKey?: string,
  spanMap?: Object,
  stickAt?: number,
  style?: StyleAttributes,
  data?: Data,
  sort?: { key: ?string, order: ?string },
|};

type State = {|
  columnSizes: Object,
  tableWidth: number,
  backgroundColor?: ?string,
  stickyCoverHeight?: number,
  translateY?: number,
  showSticky?: boolean,
  headerHeight: number,
|};

class Table extends React.Component<Props, State> {
  table: any;

  fixed: any;

  headerComponents: Object;

  static defaultProps = {
    empty: false,
    emptyText: '',
    loading: false,
    headerData: [],
  };

  constructor() {
    super();
    this.state = {
      columnSizes: {},
      tableWidth: 0,
      backgroundColor: null,
      stickyCoverHeight: 0,
      translateY: 0,
      showSticky: false,
      headerHeight: 0,
    };
    this.headerComponents = {};
  }

  componentDidMount() {
    if (this.props.stickAt != null) {
      document.addEventListener('scroll', this.handleScroll);
      window.addEventListener('resize', this.handleWindowResize);
      const init = () => {
        this.handleWindowResize();
        this.handleScroll();
      };
      this.calculateSizes(init);
    } else {
      this.calculateSizes();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.stickAt && !isEqual(this.props, prevProps)) {
      this.calculateSizes();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.calculateSizes();
    this.handleScroll();
  };

  handleScroll = () => {
    const { stickAt } = this.props;
    if (stickAt != null) {
      const tableTopOffset = this.table.getBoundingClientRect().top;
      const tableBottomOffset = this.table.getBoundingClientRect().bottom;
      const topAtOrAboveStickyPoint = tableTopOffset < stickAt;
      const bottomAtOrAboveStickyPoint = tableBottomOffset - this.state.headerHeight < stickAt;
      let isVisible = false;
      if (topAtOrAboveStickyPoint && !bottomAtOrAboveStickyPoint) {
        isVisible = true;
      }
      this.fixed.style.height = `${this.props.stickAt + this.state.headerHeight}px`;
      this.fixed.style['pointer-event'] = isVisible ? 'auto' : 'none';
      this.fixed.style.opacity = isVisible ? 1 : 0;
    }
  };

  updateState = (newState: State, callback?: () => mixed) => {
    // only update the state if it changed to save on updates
    // and prevent a render loop
    if (!isEqual(pick(this.state, keys(newState)), newState)) {
      this.setState(newState, callback);
    }
  };

  calculateSizes = (callback?: () => mixed) => {
    const headerSizes = {};
    let maxHeaderHeight = 0;
    forEach(this.headerComponents, (value, key) => {
      const headerCompStyle = window.getComputedStyle(value, null);
      const width = parseInt(headerCompStyle.getPropertyValue('width'), 10);
      const height = parseInt(headerCompStyle.getPropertyValue('height'), 10);
      headerSizes[key] = { width, height };
      if (height > maxHeaderHeight) {
        maxHeaderHeight = height;
      }
    });
    const tableWidth = parseInt(this.table.offsetWidth, 10);
    this.updateState(
      {
        columnSizes: headerSizes,
        headerHeight: maxHeaderHeight,
        tableWidth,
      },
      callback
    );
  };

  renderStickyHeader() {
    return this.renderHeader({ sticky: true });
  }

  renderCarat() {
    const { sort } = this.props;
    return <Icon color="#fff" icon={sort && sort.order === 'asc' ? downArrow : upArrow} />;
  }

  renderHeader(opts: Object = {}) {
    const { sort, onSort } = this.props;
    const headerComponents = map(this.props.headerData, value => {
      let colStyles = { width: value.width };
      const { key } = value;

      if (opts.sticky && this.state.columnSizes[key] && !value.width) {
        colStyles = { width: this.state.columnSizes[key].width };
      }
      const cellStyle = cx(style.cell, {
        [style.sortableColumn]: value.sortable,
      });
      return (
        <th
          className={cx({ [cellStyle]: true, [style.condensedCell]: value.condensed })}
          style={colStyles}
          key={key}
          ref={c => {
            if (!opts.sticky) {
              this.headerComponents[key] = c;
            }
          }}
          onClick={() => value.sortable && onSort && onSort(key)}
        >
          {value.label}
          {sort && key === sort.key && this.renderCarat()}
          {value.sortable && (
            <div
              className={cx(style.sortableColumnHighlight, {
                [style.sortableColumnHighlightSelected]: this.props.selectedColumnKey === key,
              })}
            />
          )}
        </th>
      );
    });
    return (
      <thead>
        <tr className={cx(style.row, style.header)}>{headerComponents}</tr>
      </thead>
    );
  }

  renderItems() {
    let spanKey;
    let spannedHeaderKeys;

    const {
      clickable,
      empty,
      emptyText,
      headerData,
      highlightable,
      items,
      loading,
      spanMap,
    } = this.props;

    const totalColumns = headerData.length;

    if (loading) {
      return (
        <tbody className={style.tbody}>
          <tr className={style.row}>
            <td className={style.cell} colSpan={totalColumns}>
              <span className={style.loadingText}>Loading...</span>
            </td>
          </tr>
        </tbody>
      );
    }

    if (empty && emptyText) {
      return (
        <tbody className={style.tbody}>
          <tr className={style.row}>
            <td className={style.cell} colSpan={totalColumns}>
              {typeof emptyText === 'string' ? (
                <span className={style.emptyText}>{emptyText}</span>
              ) : (
                emptyText
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    if (spanMap) {
      // eslint-disable-next-line prefer-destructuring
      spanKey = keys(spanMap)[0];
      spannedHeaderKeys = spanMap[spanKey];
    }

    const headerKeys = map(headerData, 'key');

    const rowComponents = [];

    forEach(items, (itemValue, itemIndex) => {
      const spanCount = get(itemValue[spanKey], 'length');
      const columnComponents = [];
      const isDisabledRow = itemValue.disabled;

      forEach(headerKeys, headerKey => {
        const isInnerKey = includes(spannedHeaderKeys, headerKey);
        const headerDataVal = find(headerData, { key: headerKey });
        const isCondensed = headerDataVal && headerDataVal.condensed;
        let cellValue;
        let rowsToSpan;

        if (!isInnerKey) {
          rowsToSpan = spanCount;
          cellValue = itemValue[headerKey];
        } else {
          cellValue = itemValue[spanKey][0][headerKey];
        }

        if (!cellValue) {
          cellValue = '-';
        }

        columnComponents.push(
          <td
            className={cx(style.cell, {
              [style.condensedCell]: isCondensed,
            })}
            key={headerKey}
            rowSpan={rowsToSpan}
          >
            {cellValue}
          </td>
        );
      });

      rowComponents.push(
        <tr
          key={itemIndex}
          className={cx(style.row, itemValue.rowClassName, {
            [style.rowDisabled]: isDisabledRow,
            [style.clickable]: clickable,
            [style.highlightable]: highlightable,
          })}
        >
          {columnComponents}
        </tr>
      );

      // Create the remaining partial rows if necessary
      if (spanCount) {
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < spanCount; i++) {
          const partialRowColumns = [];
          forEach(spannedHeaderKeys, key => {
            partialRowColumns.push(
              <td key={key} className={style.cell}>
                {itemValue[spanKey][i][key]}
              </td>
            );
          });
          rowComponents.push(
            <tr
              key={`${itemIndex}.${i}`}
              className={cx(style.row, itemValue.rowClassName, {
                [style.rowDisabled]: isDisabledRow,
                [style.clickable]: clickable,
                [style.highlightable]: highlightable,
              })}
            >
              {partialRowColumns}
            </tr>
          );
        }
      }
    });

    return <tbody className={style.tbody}>{rowComponents}</tbody>;
  }

  render() {
    return (
      <div {...getDataAttrs(this.props.data)} style={this.props.style} className={style.wrapper}>
        {this.props.stickAt != null && (
          <div
            // eslint-disable-next-line no-return-assign
            ref={c => (this.fixed = c)}
            className={cx(style.table, style.sticky)}
            style={{
              backgroundColor: this.state.backgroundColor,
              width: this.state.tableWidth,
            }}
          >
            <table
              style={{
                width: this.state.tableWidth,
              }}
            >
              {this.renderStickyHeader()}
            </table>
          </div>
        )}
        <table
          ref={c => {
            this.table = c;
          }}
          className={style.table}
        >
          {this.renderHeader()}
          {this.renderItems()}
        </table>
      </div>
    );
  }
}

Table.displayName = 'Plasma@Table';

export default Table;
