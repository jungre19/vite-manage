/**
 * @file request.js
 * @description axios请求封装
 * @date 2023-03-01
 * @version 1.0.0
 * @author: yangyi
 */
import axios from 'axios'
import global_config from '@/config'
import S from '@/utils/util'
import { Message } from 'element-ui'
import {
  authExpiredTime,
  getAuthId,
  getAuthSeq,
  getClinicid,
  getLoginInfo,
  getUid,
  logout,
  writeLoginCookie
} from '@/utils/runtime'

// import Qs from 'qs'
import store from '@/store'

let ifSign = ''
// const CancelToken = axios.CancelToken;
// const source = CancelToken.source();
// 创建 axios 实例
const instance = axios.create( {
  baseURL: global_config.ApiDomain,
  timeout: 10000,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
} )

// 取消重复请求
/*  假如用户重复点击按钮，先后提交了 A 和 B 这两个完全相同（考虑请求路径、方法、参数）的请求，我们可以从以下几种拦截方案中选择其一：
 1. 取消 A 请求，只发出 B 请求（会导致A请求已经发出去,被后端处理了）
 2. 取消 B 请求，只发出 A 请求
 3. 取消 B 请求，只发出 A 请求，把收到的 A 请求的返回结果也作为 B 请求的返回结果
 第3种方案需要做监听处理增加了复杂性，结合我们实际的业务需求，最后采用了第2种方案来实现，即：
 只发第一个请求。在 A 请求还处于 pending 状态时，后发的所有与 A 重复的请求都取消，实际只发出 A 请求，直到 A 请求结束（成功/失败）才停止对这个请求的拦截。
*/
// import { generateReqKey } from './commonFuns';
// addPendingRequest ：用于把当前请求信息添加到pendingRequest对象 中；
const pendingRequest = new Map() // Map对象保存键值对。任何值(对象或者原始值) 都可以作为一个键或一个值。
const duplicateRequest = ['/his/v2/medical.assistant.dialectical']
function addPendingRequest( config ) {
  if(duplicateRequest.includes(config.url) ){
    const requestKey = generateReqKey(config);
    config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
      if (!pendingRequest.has(requestKey)) {
        pendingRequest.set(requestKey, cancel);
      }
    });
    // console.log(pendingRequest)
    
  }
}

// removePendingRequest：检查是否存在重复请求，若存在则取消已发的请求。
function removePendingRequest( config ) {
  const requestKey = generateReqKey(config);
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey);
    cancelToken();
    pendingRequest.delete(requestKey);
  }
}
const isJsonStr = str => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      // console.log('error：' + str + '!!!' + e);
      return false;
    }
  }
};
// generateReqKey ：用于根据当前请求的信息，生成请求 Key；
function generateReqKey( config ) {
  // 响应的时候，response.config 中的data 是一个JSON字符串，所以需要转换一下
  // if ( config && config.data && isJsonStr( config.data ) ) {
  //   config.data = JSON.parse( config.data )
  // }
  const { method, url, params, data } = config // 请求方式，参数，请求地址，
  return [method, url].join( '&' ) // 拼接
}

function changeParams( config, params ) {
  Object.keys( params ).forEach( ( item ) => {
    if ( typeof (params[item]) == 'object' ) {
      params[item] = JSON.stringify( params[item] )
    }
    if ( typeof (params[item]) == 'undefined' ) {
      params[item] = ''
    }
  } )
  config.params = params
  config.params['nonceStr'] = S.random( 16 )
  config.params['timestamp'] = String( Date.now() ).slice( 0, 10 )
  ifSign = config.params['ifsign'] = S.makeApiSign( config.params )
  config.data = undefined
  
}

// 获取剩余有效时间
function maxAge() {
  let info = getLoginInfo()
  // 获取过期时间的时间戳
  let time_stamp = info.time_stamp
  // 获取当前时间戳
  let current_time_stamp = new Date().getTime() / 1000
  // 获取剩余时间
  let surplus_time = Number( time_stamp ) - Number( current_time_stamp )
  let effective_section_time = 2 * 60 * 60
  let add_time_stamp = 30 * 60
  if ( 0 < surplus_time&& surplus_time<= effective_section_time ) {
    // 说明有效时间小于两个小时了,此时延长半个小时
    info.time_stamp = info.time_stamp + add_time_stamp
    info.expires = new Date( new Date( time_stamp*1000 ).getTime() + add_time_stamp * 1000 )
    writeLoginCookie( info )
  }
}

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // console.log( '-> %c config  === %o ', 'font-size: 24px;color:#67C23A ', config )
    // console.log(config,"请求拦截器");
    // 设置请求签名参数
    // 并重新设置请求的参数
    
    // 没有auth_id,才刷新时间
    if (getAuthId() == '') {
      maxAge()
    }
    
    if ( config.method == 'get' ) {
      let params = config.params || config.data || {}
      // 将数组和对象类型的数据转换为JSON字符串
      // Object.keys(params).forEach((item) => {
      //   if (typeof (params[item]) == 'object') {
      //     params[item] = JSON.stringify(params[item])
      //   }
      //   if (typeof (params[item]) == 'undefined') {
      //     params[item] = ''
      //   }
      // })
      changeParams( config, params )
      
    } else {
      let data = config.data || config.params || {}
      
      //将数组和对象类型的数据转换为JSON字符串
      Object.keys( data ).forEach( ( item ) => {
        if ( typeof (data[item]) == 'object' ) {
          data[item] = JSON.stringify( data[item] )
        }
        if ( typeof (data[item]) == 'undefined' ) {
          data[item] = ''
        }
      } )
      data['nonceStr'] = S.random( 16 )
      data['timestamp'] = String( Date.now() ).slice( 0, 10 )
      data['ifsign'] = S.makeApiSign( data )
      ifSign = S.makeApiSign( data )
      // 默认情况下，axios将JavaScript对象序列化为JSON。
      // 要以application / x-www-form-urlencoded格式发送数据
      // 可以使用URLSearchParams API
      const params = new URLSearchParams()
      for ( let k in data ) params.append( k, data[k] )
      config.data = params
      config.params = undefined
      
    }
    
    // 环境参数
    let spm = ''
    let uid = getUid()
    let clinicid = getClinicid()
    let auth_id = getAuthId()
    let auth_seq = getAuthSeq()
    let auth_expired_time = authExpiredTime()
    
    let evnParams = {
      timezone: 8,
      resolution: document.body.clientWidth + '*' + document.body.clientHeight,
      channel: 'h5',
      os: 'h5',
      device_id: '',
      uidentity: uid,
      clinic_id: clinicid,
      spm: spm,
      app_version: global_config.codeVersion,
    }
    
    /**
     * @description: auth_id,auth_seq,auth_expired_time有值就加到环境参数中
     * */
    auth_id && (evnParams.auth_id = auth_id)
    auth_seq && (evnParams.auth_seq = auth_seq)
    auth_expired_time && (evnParams.auth_expired_time = auth_expired_time)
    
    config.headers['IFENV'] = JSON.stringify( evnParams )
    // config.headers['x-csrf-token'] = ifSign
    // console.log("-> %c S.makeApiSign(config.params)  === %o ", "font-size: 15px", S.makeApiSign(config.params))
    removePendingRequest(config)
    addPendingRequest(config)
    return config
  },
  error => {
    return Promise.reject( error )
  },
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // console.log(response,"响应拦截器");
    const res = response.data
    // console.log("-> %c res  === %o", "font-size: 15px;color: green;", res)
    
    if(res.errcode == '4007'){
      Message.error('登录超时，请重新登录')
      logout()
      let env = import.meta.env.Vite_APP_NODE_ENV
      if (env === 'production') {
        window.location.href = 'https://clinic.rsjxx.com'
      } else if (env === 'test') {
        window.location.href = 'https://clinic2test.rsjxx.com'
        // window.location.href = 'http://127.0.0.1:3000'
      }else if ( env === 'test-74' ) {
        window.location.href = 'https://74clinic.rsjxx.com'
      }
      return Promise.reject( { errmsg:'登录超时，请重新登录' } )
    }else{
      if ( res.errcode != 0 ) {
        // TODO 登录超时
        // Message.error(res.errmsg)
        S.log( '登陆异常', '快去处理呀，有人翻墙了' )
        // console.log( res )
        return Promise.reject( res )
        // return res
      }
    }
    let last_version = response.headers['x-version']
    if ( !S.isServeRun && last_version != undefined && last_version != '' ) {
      store.dispatch( 'version/checkVersion', last_version ).then()
    }
    removePendingRequest(response.config); // 从pendingRequest对象中移除请求
    return res.data
  },
  error => {
    removePendingRequest(error.config || {}); // 从pendingRequest对象中移除请求
    return Promise.reject( {
      errmsg: String( error ),
    } )
  },
)

export default instance