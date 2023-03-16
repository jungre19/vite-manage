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
    emit('update:visible', true)
    emit('update:msg', '我是子组件的msg')
}
const emit =  defineEmits(['update:visible', 'update:msg'])
</script>

<style lang="scss" scoped>

</style>