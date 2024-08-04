<script lang="ts" setup>
import { ref } from 'vue';
import { version } from '../package.json';

defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <h1>{{ msg }}</h1>
  <p> 网页小组件开发中... </p>
  <p class="read-the-docs">{{ version }}</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
