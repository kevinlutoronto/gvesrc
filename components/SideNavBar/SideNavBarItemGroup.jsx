// @flow
import React, { Component } from 'react';
import { find } from 'lodash';
import SideNavBarItem from './SideNavBarItem';
import { type Item } from './SideNavBar';
import style from './style.scss';

type Props = {|
  id: string,
  icon?: string,
  iconSize: number,
  iconStyle?: Object,
  label: React$Node,
  onClick?: ({ id: string }) => mixed,
  items?: Array<Item>,
  selectedId?: string,
|};

class SideNavBarItemGroup extends Component<Props> {
  static defaultProps = {
    label: 'Label',
    iconSize: 22,
  };

  handleGroupClick = () => {
    if (this.props.onClick) {
      if (this.props.items && this.props.items[0]) {
        this.props.onClick({ id: this.props.items[0].id });
      } else {
        this.props.onClick({ id: this.props.id });
      }
    }
  };

  handleItemClick = (itemId: string): void => {
    if (this.props.onClick) {
      this.props.onClick({ id: itemId });
    }
  };

  renderIconAndLabel() {
    const { icon, iconSize, iconStyle, label, items } = this.props;
    if (!find(items, item => !item.hidden)) {
      return null;
    }

    const iconToRender = icon && iconSize && (
      <img
        className={style.icon}
        style={{
          width: iconSize,
          height: iconSize,
          ...iconStyle,
        }}
        src={icon}
        alt={label}
      />
    );

    return (
      <div onClick={this.handleGroupClick} className={style.iconAndLabelContainer}>
        <div className={style.iconWrapper}>{iconToRender}</div>
        <div className={style.groupLabelWrapper}>{label}</div>
      </div>
    );
  }

  renderSubItems(): ?React$Node {
    return (
      this.props.items &&
      this.props.items.map((groupedItem: Item) => {
        return (
          !groupedItem.hidden && (
            <SideNavBarItem
              key={groupedItem.id}
              id={groupedItem.id}
              label={groupedItem.label}
              tagText={groupedItem.tagText}
              onClick={this.handleItemClick}
              selected={groupedItem.id === this.props.selectedId}
              linkComponent={groupedItem.linkComponent}
            />
          )
        );
      })
    );
  }

  render() {
    return (
      <div className={style.groupWrapper}>
        {this.renderIconAndLabel()}
        <div className={style.groupSubItems}>{this.renderSubItems()}</div>
      </div>
    );
  }
}

SideNavBarItemGroup.displayName = 'Plasma@SideNavBarItemGroup';

export default SideNavBarItemGroup;
