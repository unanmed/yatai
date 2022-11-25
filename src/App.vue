<template>
    <div id="app">
        <One></One>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import One from './panel/one.vue';
</script>

<style lang="less" scoped>
#app {
    width: 100%;
    height: 100%;
}
</style>

<style>
html,
body {
    width: 100%;
    height: 100%;
    background-color: black;
    padding: 0;
    margin: 0;
}
</style>
