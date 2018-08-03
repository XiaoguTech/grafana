import React from 'react';
import classNames from 'classnames';
import { PanelModel } from '../panel_model';
import { PanelContainer } from './PanelContainer';
import templateSrv from 'app/features/templating/template_srv';
import appEvents from 'app/core/app_events';

export interface DashboardRowProps {
  panel: PanelModel;
  getPanelContainer: () => PanelContainer;
}

export class DashboardRow extends React.Component<DashboardRowProps, any> {
  dashboard: any;
  panelContainer: any;

  constructor(props) {
    super(props);

    this.state = {
      collapsed: this.props.panel.collapsed,
    };

    this.panelContainer = this.props.getPanelContainer();
    this.dashboard = this.panelContainer.getDashboard();

    this.toggle = this.toggle.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  toggle() {
    this.dashboard.toggleRow(this.props.panel);

    this.setState(prevState => {
      return { collapsed: !prevState.collapsed };
    });
  }

  update() {
    this.dashboard.processRepeats();
    this.forceUpdate();
  }

  openSettings() {
    appEvents.emit('show-modal', {
      templateHtml: `<row-options row="model.row" on-updated="model.onUpdated()" dismiss="dismiss()"></row-options>`,
      modalClass: 'modal--narrow',
      model: {
        row: this.props.panel,
        onUpdated: this.update.bind(this),
      },
    });
  }

  delete() {
    appEvents.emit('confirm-modal', {
      title: '删除行',
      text: '确定想要删除删除该行及下属所有面板?',
      altActionText: '只删除行',
      icon: 'fa-trash',
      onConfirm: () => {
        const panelContainer = this.props.getPanelContainer();
        const dashboard = panelContainer.getDashboard();
        dashboard.removeRow(this.props.panel, true);
      },
      onAltAction: () => {
        const panelContainer = this.props.getPanelContainer();
        const dashboard = panelContainer.getDashboard();
        dashboard.removeRow(this.props.panel, false);
      },
    });
  }

  render() {
    const classes = classNames({
      'dashboard-row': true,
      'dashboard-row--collapsed': this.state.collapsed,
    });
    const chevronClass = classNames({
      fa: true,
      'fa-chevron-down': !this.state.collapsed,
      'fa-chevron-right': this.state.collapsed,
    });

    const title = templateSrv.replaceWithText(this.props.panel.title, this.props.panel.scopedVars);
    const count = this.props.panel.panels ? this.props.panel.panels.length : 0;
    const panels = count === 1 ? 'panel' : 'panels';

    return (
      <div className={classes}>
        <a className="dashboard-row__title pointer" onClick={this.toggle}>
          <i className={chevronClass} />
          {title}
          <span className="dashboard-row__panel_count">
            ({count} {panels})
          </span>
        </a>
        {this.dashboard.meta.canEdit === true && (
          <div className="dashboard-row__actions">
            <a className="pointer" onClick={this.openSettings}>
              <i className="fa fa-cog" />
            </a>
            <a className="pointer" onClick={this.delete}>
              <i className="fa fa-trash" />
            </a>
          </div>
        )}
        {this.state.collapsed === true && (
          <div className="dashboard-row__toggle-target" onClick={this.toggle}>
            &nbsp;
          </div>
        )}
        <div className="dashboard-row__drag grid-drag-handle" />
      </div>
    );
  }
}
