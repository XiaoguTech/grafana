import _ from 'lodash';
import { types, getEnv } from 'mobx-state-tree';
import { NavItem } from './NavItem';
import { Team } from '../TeamsStore/TeamsStore';

export const NavStore = types
  .model('NavStore', {
    main: types.maybe(NavItem),
    node: types.maybe(NavItem),
  })
  .actions(self => ({
    load(...args) {
      let children = getEnv(self).navTree;
      let main, node;
      const parents = [];

      for (const id of args) {
        node = children.find(el => el.id === id);

        if (!node) {
          throw new Error(`NavItem with id ${id} not found`);
        }

        children = node.children;
        parents.push(node);
      }

      main = parents[parents.length - 2];

      if (main.children) {
        for (const item of main.children) {
          item.active = false;

          if (item.url === node.url) {
            item.active = true;
          }
        }
      }

      self.main = NavItem.create(main);
      self.node = NavItem.create(node);
    },

    initFolderNav(folder: any, activeChildId: string) {
      const main = {
        icon: 'fa fa-folder-open',
        id: 'manage-folder',
        subTitle: '管理文件夹仪表盘及权限',
        url: '',
        text: folder.title,
        breadcrumbs: [{ title: '仪表盘', url: 'dashboards' }],
        children: [
          {
            active: activeChildId === 'manage-folder-dashboards',
            icon: 'fa fa-fw fa-th-large',
            id: 'manage-folder-dashboards',
            text: '仪表盘',
            url: folder.url,
          },
          {
            active: activeChildId === 'manage-folder-permissions',
            icon: 'fa fa-fw fa-lock',
            id: 'manage-folder-permissions',
            text: '权限',
            url: `${folder.url}/permissions`,
          },
          {
            active: activeChildId === 'manage-folder-settings',
            icon: 'fa fa-fw fa-cog',
            id: 'manage-folder-settings',
            text: '设置',
            url: `${folder.url}/settings`,
          },
        ],
      };

      self.main = NavItem.create(main);
    },

    initDatasourceEditNav(ds: any, plugin: any, currentPage: string) {
      let title = '添加';
      const subTitle = `类型: ${plugin.name}`;

      if (ds.id) {
        title = ds.name;
      }

      const main = {
        img: plugin.info.logos.large,
        id: 'ds-edit-' + plugin.id,
        subTitle: subTitle,
        url: '',
        text: title,
        breadcrumbs: [{ title: '数据源', url: 'datasources' }],
        children: [
          {
            active: currentPage === 'datasource-settings',
            icon: 'fa fa-fw fa-sliders',
            id: 'datasource-settings',
            text: '设置',
            url: `datasources/edit/${ds.id}`,
          },
        ],
      };

      const hasDashboards = _.find(plugin.includes, { type: 'dashboard' }) !== undefined;
      if (hasDashboards && ds.id) {
        main.children.push({
          active: currentPage === 'datasource-dashboards',
          icon: 'fa fa-fw fa-th-large',
          id: 'datasource-dashboards',
          text: '仪表盘',
          url: `datasources/edit/${ds.id}/dashboards`,
        });
      }

      self.main = NavItem.create(main);
    },

    initTeamPage(team: Team, tab: string, isSyncEnabled: boolean) {
      const main = {
        img: team.avatarUrl,
        id: 'team-' + team.id,
        subTitle: '管理团队及其设置',
        url: '',
        text: team.name,
        breadcrumbs: [{ title: '团队', url: 'org/teams' }],
        children: [
          {
            active: tab === 'members',
            icon: 'gicon gicon-team',
            id: 'team-members',
            text: '成员',
            url: `org/teams/edit/${team.id}/members`,
          },
          {
            active: tab === 'settings',
            icon: 'fa fa-fw fa-sliders',
            id: 'team-settings',
            text: '设置',
            url: `org/teams/edit/${team.id}/settings`,
          },
        ],
      };

      if (isSyncEnabled) {
        main.children.splice(1, 0, {
          active: tab === 'groupsync',
          icon: 'fa fa-fw fa-refresh',
          id: 'team-settings',
          text: '同步外部组',
          url: `org/teams/edit/${team.id}/groupsync`,
        });
      }

      self.main = NavItem.create(main);
    },
  }));
