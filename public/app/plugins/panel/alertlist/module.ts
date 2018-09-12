import _ from 'lodash';
import moment from 'moment';
import alertDef from '../../../features/alerting/state/alertDef';
import { PanelCtrl } from 'app/plugins/sdk';

import * as dateMath from 'app/core/utils/datemath';

class AlertListPanel extends PanelCtrl {
  static templateUrl = 'module.html';
  static scrollable = true;

  showOptions = [{ text: '当前状态', value: 'current' }, { text: '近期状态改变', value: 'changes' }];

  sortOrderOptions = [
    { text: '字母序 (升序)', value: 1 },
    { text: '字母序 (降序)', value: 2 },
    { text: '重要因子', value: 3 },
  ];

  stateFilter: any = {};
  currentAlerts: any = [];
  alertHistory: any = [];
  noAlertsMessage: string;

  // Set and populate defaults
  panelDefaults = {
    show: 'current',
    limit: 10,
    stateFilter: [],
    onlyAlertsOnDashboard: false,
    sortOrder: 1,
    dashboardFilter: '',
    nameFilter: '',
    folderId: null,
  };

  /** @ngInject */
  constructor($scope, $injector, private backendSrv) {
    super($scope, $injector);
    _.defaults(this.panel, this.panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));

    for (const key in this.panel.stateFilter) {
      this.stateFilter[this.panel.stateFilter[key]] = true;
    }
  }

  sortResult(alerts) {
    if (this.panel.sortOrder === 3) {
      return _.sortBy(alerts, a => {
        return alertDef.alertStateSortScore[a.state];
      });
    }

    const result = _.sortBy(alerts, a => {
      return a.name.toLowerCase();
    });
    if (this.panel.sortOrder === 2) {
      result.reverse();
    }

    return result;
  }

  updateStateFilter() {
    const result = [];

    for (const key in this.stateFilter) {
      if (this.stateFilter[key]) {
        result.push(key);
      }
    }

    this.panel.stateFilter = result;
    this.onRefresh();
  }

  onRefresh() {
    let getAlertsPromise;

    if (this.panel.show === 'current') {
      getAlertsPromise = this.getCurrentAlertState();
    }

    if (this.panel.show === 'changes') {
      getAlertsPromise = this.getStateChanges();
    }

    getAlertsPromise.then(() => {
      this.renderingCompleted();
    });
  }

  onFolderChange(folder: any) {
    this.panel.folderId = folder.id;
    this.refresh();
  }

  getStateChanges() {
    const params: any = {
      limit: this.panel.limit,
      type: 'alert',
      newState: this.panel.stateFilter,
    };

    if (this.panel.onlyAlertsOnDashboard) {
      params.dashboardId = this.dashboard.id;
    }

    params.from = dateMath.parse(this.dashboard.time.from).unix() * 1000;
    params.to = dateMath.parse(this.dashboard.time.to).unix() * 1000;

    return this.backendSrv.get(`/api/annotations`, params).then(res => {
      this.alertHistory = _.map(res, al => {
        al.time = this.dashboard.formatDate(al.time, 'MMM D, YYYY HH:mm:ss');
        al.stateModel = alertDef.getStateDisplayModel(al.newState);
        al.info = alertDef.getAlertAnnotationInfo(al);
        return al;
      });

      this.noAlertsMessage = this.alertHistory.length === 0 ? '近期暂无告警状态变更' : '';

      return this.alertHistory;
    });
  }

  getCurrentAlertState() {
    const params: any = {
      state: this.panel.stateFilter,
    };

    if (this.panel.nameFilter) {
      params.query = this.panel.nameFilter;
    }

    if (this.panel.folderId >= 0) {
      params.folderId = this.panel.folderId;
    }

    if (this.panel.dashboardFilter) {
      params.dashboardQuery = this.panel.dashboardFilter;
    }

    if (this.panel.onlyAlertsOnDashboard) {
      params.dashboardId = this.dashboard.id;
    }

    if (this.panel.dashboardTags) {
      params.dashboardTag = this.panel.dashboardTags;
    }

    return this.backendSrv.get(`/api/alerts`, params).then(res => {
      this.currentAlerts = this.sortResult(
        _.map(res, al => {
          al.stateModel = alertDef.getStateDisplayModel(al.state);
          al.newStateDateAgo = moment(al.newStateDate)
            .locale('en')
            .fromNow(true);
          return al;
        })
      );
      if (this.currentAlerts.length > this.panel.limit) {
        this.currentAlerts = this.currentAlerts.slice(0, this.panel.limit);
      }
      this.noAlertsMessage = this.currentAlerts.length === 0 ? '没有告警' : '';

      return this.currentAlerts;
    });
  }

  onInitEditMode() {
    this.addEditorTab('选项', 'public/app/plugins/panel/alertlist/editor.html');
  }
}

export { AlertListPanel, AlertListPanel as PanelCtrl };
