<template>
    <div id="app">
        <div id="select">
            <span>绘制模式：</span>
            <a-select v-model:value="mode" style="width: 10%">
                <a-select-option v-for="m of modes" :value="m">{{
                    m
                }}</a-select-option>
            </a-select>
        </div>
        <One v-if="mode === 'one'"></One>
        <Multi v-else-if="mode === 'multi'"></Multi>
        <Global v-else-if="mode === 'global'"></Global>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Multi from './panel/multi.vue';
import One from './panel/one.vue';
import Global from './panel/global.vue';

const mode = ref('one');
const modes = ['one', 'multi', 'global'];
</script>

<style lang="less" scoped>
#app {
    width: 100%;
    height: 100%;
}

#select {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
}
</style>

<style>
html,
body {
    width: 100%;
    height: 100%;
    background-color: white;
    padding: 0;
    margin: 0;
}
</style>
