/**
 * 配置汇总导出
 */
import app from './app.config'
import net from './net.config'
import permission from './permission'

// 分页配置
export const PAGINATION = {
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
}

// 默认导出：合并所有配置
export default {
  ...app,
  ...net,
  ...permission,
}

// 模块导出
export { app, net, permission }