import {computed} from 'vue'
import {PC_DEVICE_WIDTH} from '../constants'
import {useWindowSize} from '@vueuse/core'
/**
 * 判断当前是否为移动设备，判断依据屏幕宽度是否小于一个指定宽度（1280）
 */
export const isMobileTerminal = computed(() => {
  return useWindowSize().width.value < PC_DEVICE_WIDTH
})
// export const isMobileTerminal = computed(() => {
//   return  /Androidlwebos l iPhoneliPadliPodi BLackBerryIIEMobile lOpera Mini/i.test(navigator.userAgent)
// })