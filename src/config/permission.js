/**
 * 权限配置
 */
export default {
  // Token配置
  tokenKey: 'token',           // localStorage key
  userKey: 'user',             // localStorage key
  
  // 路由白名单（不需要登录）
  routesWhiteList: ['/login', '/404', '/401'],
}