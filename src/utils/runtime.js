import Cookies from 'js-cookie'
import S from "@/utils/util";

const LoginCookieName = 'BACKEND_PASSPORT_V001'

export const isLogin = () => {
  let uid = getUid();
  return uid > 0
}

export const getUid = () => {
  let user = getUser();
  return Number(user.uid) || 0;
}

export const getUname = () => {
  let user = getUser();
  return user.name;
}

export const getClinicid = () => {
  let user = getUser();
  return user.clinicid || ''
}

export const getUser = () => {
  return getLoginInfo()
}
export const getAuthId = () => {
  let user = getUser();
  return user.auth_id || ''
}

export const getAuthSeq = () => {
  let user = getUser();
  return user.auth_seq || ''
}

export const authExpiredTime = () => {
  let user = getUser();
  return user.auth_expired_time || ''
}

export const getLoginInfo = () => {
  let info = Cookies.get(S.generateStorageKey(LoginCookieName)) || '{}'
  return JSON.parse(info)
}

export const writeLoginCookie = (info) => {
  Cookies.set(S.generateStorageKey(LoginCookieName), JSON.stringify(info), {
    expires: info.expires || 0,
  })
  return true;
}

export const logout = () => {
  Cookies.remove(S.generateStorageKey(LoginCookieName))
  return true;
}

export const isEarlyAccess = () => {
  return getUser().his_early_access
}

export const getEnv = () => {
  return import.meta.env.Vite_APP_NODE_ENV
}

