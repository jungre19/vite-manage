<script setup>
import { isMobileTerminal } from '@/utils/flexible'
import { onBeforeMount, onMounted, reactive, ref, watch, watchEffect } from 'vue';
import MyCom from './components/MyCom.vue';
import HelloWorld from '@/components/HelloWorld.vue';
const count = ref(0)
const elm = ref(null)
const timer = ref(null)
onMounted(() => {
  timer.value = setInterval(() => {

    count.value++
  }, 200);
})
const sonMsg = ref('我是父组件的msg')
const visible = ref(false)
/**
 * 1、一开始会触发一次，然后在依赖变化的时候触发
 * 2、触发的时机是数据相应后，DOM更新前，通过flush: 'post'可以改变触发时机,在DOM更新后触发
 * 3、返回结果是一个stop，可以通过stop方法停止监听
 * 4、提供一个形参，主要用于清除上一次行为，比如清除定时器
 */
const stop = watchEffect((cb) => {
  // // console.log('count::: ', count);
  cb(() => {
    console.log("%c  === ->  test    ---- %o ", "font-size: 15px;color: green;", 'test');
  })
}, {
  flush: 'post'
})
setTimeout(() => {
  stop()
  clearInterval(timer.value)
  console.log("%c  line:31 timer-> $$  === %o", "font-size: 15px;color: green; ", timer);
  console.log('%c $$ line:31 timer->   === %o, "font-size: 15px;color: green;", $$ ', timer);
  console.log("-> %c data  === %o", "font-size: 15px;color: green;", timer.value)

  console.log('line:31 timer:::, "font-size: 15px;color: pink; ', timer);
}, 1000)
const lal = () => {
}
</script>
<template>
  <div ref="elm" :style="{ background: isMobileTerminal ? 'pink' : 'orange', }"
    class="test flex flex-col justify-center items-center px-1.5">
    {{ isMobileTerminal }}
    {{ count }}
    <my-com v-model:msg="sonMsg" v-model:visible="visible"></my-com>
    <div class="circle" v-show="visible">

    </div>
  </div>
  <hello-world></hello-world>
</template>
<style lang="scss" scoped>
.circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f00;
}

.test {
  font-size: 62px;
  color: #0f0 !important;
  ;
}
</style>
