<script setup>
import {isMobileTerminal} from '@/utils/flexible'
import { onBeforeMount, onMounted, reactive, ref, watch,watchEffect } from 'vue';
const count = ref(0)
const elm = ref(null)
const timer = ref(null)
onMounted(()=>{
   timer.value = setInterval(() => {
    count.value++
  }, 200);
})
watch(count,(val,oldVal)=>{
  
console.log(" %c  ->  === %o ::: ", "font-size: 15px;color: green;", );
  
  console.log('val"-> %c   === ", "font-size: 15px;color: green;",  ', val, 'line:13');
  // // console.log('val,oldVal::: ', val,oldVal);
})
/**
 * 1、一开始会触发一次，然后在依赖变化的时候触发
 * 2、触发的时机是数据相应后，DOM更新前，通过flush: 'post'可以改变触发时机,在DOM更新后触发
 * 3、返回结果是一个stop，可以通过stop方法停止监听
 * 4、提供一个形参，主要用于清除上一次行为，比如清除定时器
 */
const stop = watchEffect((cb)=>{
  // // console.log('count::: ', count);
  cb(()=>{
  })
},{
  flush: 'post'
})
setTimeout(()=>{
  stop()
  clearInterval(timer.value)
  console.log("%c  line:31 timer-> $$  === %o", "font-size: 15px;color: green; ", timer);
  console.log('%c $$ line:31 timer->   === %o, "font-size: 15px;color: green;", $$ ', timer);
  console.log("-> %c data  === %o", "font-size: 15px;color: green;", timer.value)

  console.log('line:31 timer:::, "font-size: 15px;color: pink; ', timer);
},1000)
const lal = ()=>{
}
</script>
<template>
  <div ref="elm" :style="{background:isMobileTerminal?'pink':'orange',width:'200px',height: '200px'}" class="test flex justify-center items-center">
    <el-button @click="lal">点我</el-button>
    {{ isMobileTerminal }}
    {{ count }}
  </div>
</template>
<style lang="scss" scoped>
.test{
  font-size: 62px;
  color: #0f0 !important;;
}
</style>
