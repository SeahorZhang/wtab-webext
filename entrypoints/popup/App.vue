<script lang="ts" setup>
import type { TreeDataNode } from "@/types";
import BookmarksTree from "@/components/BookmarksTree.vue";

const bookmarks = ref<TreeDataNode[]>([]); // 书签数据
</script>

<template>
  <BookmarksTree v-model="bookmarks" />
</template>
