import config from '@/config'
import S from './util.kissy'
import liluri from 'lil-uri'
import jsmd5 from 'js-md5'
import Cookies from 'js-cookie'
import moment from 'moment'
import 'moment/locale/zh-cn'
import {ulid} from "ulid";
import { plus, minus, times, divide, round } from 'number-precision'
const {shortTitle, mapiSignKey, storageNamePrefix} = config
import IdentityCodeValid from '@/utils/validateIdent'
let util = {}

util = S.mix(S, util)

// 防抖函数，immediate为true时为立即执行
util.debounce = function (func, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = [...arguments];
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait)
      if (callNow) func.apply(context, args)
    }
    else {
      timeout = setTimeout(() => {
        func.apply(context, args)
      }, wait);
    }
  }
}
//节流
/**
 *
 * @param fn 事件触发的回调函数
 * @param delay 延迟时间
 */
util.throttle=function (fn, delay = 100) {
  let timer = null;
  
  return function () {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      // 执行事件的回调函数
      fn.apply(this, arguments);
      // 执行后清空定时器
      timer = null
    }, delay)
  }
}

/**
 * 根据当前跳转的路由设置显示在浏览器标签的title
 * @param route 路由对象
 */
util.setTitle = (route) => {
  let pageTitle = route.meta.title || ''
  let resTitle = pageTitle ? `${pageTitle} - ${shortTitle}` : shortTitle
  window.document.title = resTitle
}

// 加法精度
// 加法精度
util.mathAdd = ( a, b, p = 2 ) => {
  return round( plus( a, b ), p )
}
// 减法精度
util.mathSub = ( a, b, p = 2 ) => {
  return round( minus( a, b ), p )
}
// 乘法精度
util.mathMul = ( a, b, p = 2 ) => {
  return round( times( a, b ), p )
}

// 除法精度
util.mathDiv = ( a, b, p = 2 ) => {
  return round( divide( a, b ), p )
}
//小数精确度
util.toDecimal = (x, p) => {
  return round(x, p)
}
/**
 * 生成请求签名
 * @param args
 * @returns string
 */
util.makeApiSign = (args) => {
  let params = []
  for (let key in args) {
    if (key != 'ifsign') params.push(args[key])
  }
  let paramsStr = params.sort().join('')
  return util.md5(paramsStr + mapiSignKey)
}
util.chunkArr = (arr, size) => {
  //判断如果不是数组(就没有length)，或者size没有传值，size小于1，就返回空数组
  if (!arr.length || !size || size < 1) return []
  let [start, end, result] = [null, null, []]
  console.log(Math.ceil(arr.length / size))
  for (let i = 0; i < Math.ceil(arr.length / size); i++) {
    start = i * size
    end = start + size
    result.push(arr.slice(start, end))
  }
  return result
},
  /**
   * 验证请求是否有效
   * @param params
   * @returns {boolean}
   */
  util.verifyApiSign = (params) => {
    let sign = this.makeApiSign(params)
    if (params['ifsign'] != sign) {
      return false
    }
    return true
  }

/**
 * md5
 * @param message
 * @returns {string}
 */
util.md5 = message => jsmd5(message)

/**
 * 控制台输出
 * @param msg
 * @param title
 */
util.log = (msg, title) => {
  if (title) console.group('%c- ' + title + '', 'border-radius:2px;color:#000;background-color:#19be6b;font-size:12px;font-weight:600;width:100%;padding:0px 5px;')
  if (Object.prototype.toString.call(msg) === '[object Array]') {
    console.log([...msg])
  } else if (Object.prototype.toString.call(msg) === '[object Object]') {
    console.log({...msg})
  } else {
    console.log(msg)
  }
  if (title) console.groupEnd()
}

/**
 * 是否生产环境
 * @returns {boolean}
 */
util.isProdEnv = process.env.VUE_APP_NODE_ENV === 'production'

/**
 * 是否 run serve 模式运行
 * @returns {boolean}
 */
util.isServeRun = process.env.VUE_APP_CMD === 'serve'

/**
 * 生成存储Key
 * @param key
 * @returns {string}
 */
util.generateStorageKey = key => {
  let k = []
  k.push(storageNamePrefix, key)
  return k.join('-')
}

/**
 * 生成随机字符串
 * @param len
 * @returns {string}
 */
util.random = function (len = 13) {
  const $chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ123456789'
  const maxPos = $chars.length
  let str = ''
  for (let i = 0; i < len; i++) {
    str += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return str
}

/**
 * 格式化数字和金额
 * @param number 要格式化的数字
 * @param decimals 保留几位小数
 * @param dec_point 小数点符号
 * @param thousands_sep 千分位符号
 * @returns {string}
 */
util.number_format = function (number, decimals = 0, dec_point = '.', thousands_sep = ',') {
  number = (number + '').replace(/[^0-9+-Ee.]/g, '')
  let n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = thousands_sep,
    dec = dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      let k = Math.pow(10, prec)
      return '' + Math.round(n * k) / k
    }
  
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  
  if (sep) {
    let re = /(-?\d+)(\d{3})/
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, '$1' + sep + '$2')
    }
  }
  
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}

/**
 * 获取当前页面完整域名，包含协议、端口号
 * @returns {string}
 */
util.fullDomain = () => {
  return location.protocol + '//' + location.host
}
/**
 *日期转年龄
 *@returns {string}
 */
util.formatDuration = (date,needMonth) => {
  let duration = moment.duration(moment().diff(date))
  let years = duration.years()
  let months = duration.months()
  let days = duration.days()
  let result = ''
  if (years === 0) {
    return '1岁'
  }
  if (years === 1) {
    result += '1岁'
  } else if (years > 1) {
    result += years + '岁'
  }
  if(needMonth){
    if (months === 1) {
      result += '1个月'
    } else if (months > 1) {
      result += months + '个月'
    }
    if (days === 1) {
      result += ''
    } else if (days > 1) {
      result += ''
    }
  }
  
  return result
}
util.entries = (inArg)=>{
  if(Array.isArray(inArg)){
    return inArg.map((x,index)=>[`${index}`,x])
  }
  if(Object.prototype.toString.call(inArg) === `[object Object]`){
    return Object.keys(inArg).map(y=>[y,inArg[y]])
  }
  if(typeof inArg === 'number')return []
  throw 'Cannot convert argument to object'
}
/**
 * 用于转换字典项为数组
 *
 * */
util.descToArrHandle = (obj) => {
  let arr = []
  let kArr = Object.keys(obj)
  kArr.map((item, i) => {
    arr.push({
      id: item,
      desc: obj[item].desc || '',
      kw: obj[item].kw || '',
      ...obj[item]
    })
  })
  return arr
},
//数组对象去重
  util.deduplicationArray=(arr,key)=> {
    let obj = {}
    arr = arr.reduce(function (item, next) {
      obj[next.key] ? '' : obj[next.key] = true && item.push(next)
      return item
    }, [])
    return arr
  },
//数组对象去重
  util.deduplicationArray1=(arr,key)=> {
    let result = []
    let obj = {}
    for (let i = 0; i < arr.length; i++) {
      console.log(arr[i])
      if (!obj[arr[i].key]) {
        result.push(arr[i])
        obj[arr[i].key] = true
      }
    }
    console.log('result',result)
    return result
  },
  
  /**
   * 一个简单URl解析器和构建器
   * https://github.com/lil-js/uri
   *
   Parser
   let url = uri('http://user:pass@example.com:8080/bar/foo.xml?foo=bar&hello=world&#hash=1')
   url.protocol() // -> http
   url.host() // -> example.com:8080
   url.hostname() // -> example.com
   url.port() // -> 8080
   url.auth() // -> { user: 'user', password: 'pass' }
   url.user() // -> user
   url.password() // -> pass
   url.path() // -> /bar/foo.xml
   url.search() // -> foo=bar&hello=world
   url.query() // -> { foo: 'bar', hello: 'world' }
   url.hash() // -> hash=1
   
   Builder
   uri()
   .protocol('https')
   .host('example.com')
   .port('8080')
   .auth('user:pass')
   .path('/bar/foo.xml')
   .query({ foo: 'bar', hello: 'world' })
   .hash('hash=1')
   .build() // -> http://@example.com:8080/bar/foo.xml?foo=bar&hello=world&#frament=1
   */
  util.uri = liluri

/**
 * Cookies
 Cookies.set('name', 'value')
 Cookies.set('name', 'value', { expires: 7 })
 Cookies.set('name', 'value', { expires: 7, path: '' })
 Cookies.get('name') // => 'value'
 Cookies.get('nothing') // => undefined
 Cookies.get() // => { name: 'value' }
 Cookies.remove('name')
 
 Cookies.set('name', 'value', { path: '' })
 Cookies.remove('name') // fail!
 Cookies.remove('name', { path: '' }) // removed!
 */
util.Cookies = Cookies

util.moment = moment

util.getCookieDomain = function (){
  return '.' + liluri(config.ApiDomain).hostname().split('.').slice(-2).join('.')
}

util.getCookieUlid = function () {
  let ULID = S.Cookies.get('_sj_ulid') || ''
  let CookieDomain = util.getCookieDomain()
  if(!ULID){
    ULID = ulid()
    if(S.isServeRun){
      S.Cookies.set('_sj_ulid', ULID)  // 本地
    }else{
      S.Cookies.set('_sj_ulid', ULID, { expires: 9999, domain: CookieDomain }) // 线上
    }
  }
}()
// 身份证号码强校验
util.IdentityCodeValid = IdentityCodeValid
export default util
