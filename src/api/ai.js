import request from './request'

// 内容润色
export const polishContent = (data) => {
  return request.post('/ai/polish', data)
}

// 生成标题
export const generateTitle = (data) => {
  return request.post('/ai/generate-title', data)
}
