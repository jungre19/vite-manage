<template>
    <div>
        <el-button type="primary" @click="emitMsg">
        {{ msg }}
        </el-button>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    msg: {
        type: String,
        default: ''
    }
    })
const emitMsg = ()=>{
    emit('update:visible', !props.visible)
    emit('update:msg', props.visible?'我是子组件的msg':'ooxx')
}
const emit =  defineEmits(['update:visible', 'update:msg'])
</script>

<style lang="scss" scoped>

</style>