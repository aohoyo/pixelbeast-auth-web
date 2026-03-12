/**
 * 网络配置
 */
export default {
  baseURL: '/api/v1',
  timeout: 30000,
  contentType: 'application/json;charset=UTF-8',
  
  // 业务状态码
  successCode: [0, 200],
  invalidCode: 401,
  forbiddenCode: 403,
}