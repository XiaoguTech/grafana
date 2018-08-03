import { types, getEnv, flow } from 'mobx-state-tree';
import { ServerStat } from './ServerStat';

export const ServerStatsStore = types
  .model('ServerStatsStore', {
    stats: types.array(ServerStat),
    error: types.optional(types.string, ''),
  })
  .actions(self => ({
    load: flow(function* load() {
      const backendSrv = getEnv(self).backendSrv;
      const res = yield backendSrv.get('/api/admin/stats');
      self.stats.clear();
      self.stats.push(ServerStat.create({ name: '仪表盘数', value: res.dashboards }));
      self.stats.push(ServerStat.create({ name: '成员数', value: res.users }));
      self.stats.push(ServerStat.create({ name: '活跃用户数(近14天)', value: res.activeUsers }));
      self.stats.push(ServerStat.create({ name: '组织数', value: res.orgs }));
      self.stats.push(ServerStat.create({ name: '数据源数', value: res.datasources }));
      self.stats.push(ServerStat.create({ name: '播放列表数', value: res.playlists }));
      self.stats.push(ServerStat.create({ name: '快照数', value: res.snapshots }));
      self.stats.push(ServerStat.create({ name: '仪表盘标签数', value: res.tags }));
      self.stats.push(ServerStat.create({ name: '收藏仪表盘数', value: res.stars }));
      self.stats.push(ServerStat.create({ name: '报警规则数', value: res.alerts }));
    }),
  }));
