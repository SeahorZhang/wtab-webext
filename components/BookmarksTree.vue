<script lang="ts" setup>
import { getChromeBookmarks } from "@/utils/chrome";
import { recursiveChange, transformBookmark } from "@/utils/tree";
import type { ChangedTreeData, TreeDataNode, CheckedInfo } from "@/types";
import { Earth, Folder } from "@/components/icons";
import { ElMessage } from "element-plus";

const loading = ref<boolean>(false);
const bookmarks = shallowRef<TreeDataNode[]>([]);
const checkedBookmarks = ref<TreeDataNode[]>([]);

const treeProps = {
  value: "id",
  label: "title",
  children: "children",
  icon: "icon",
} as const;

/**
 * 导出书签
 */
const handleExportBookmarks = async (): Promise<void> => {
  // 检查当前页面是否为 chrome://newtab/
  const isNewTab = window.location.href.startsWith('chrome://newtab/');
  
  if (!isNewTab) {
    // 将数据临时存储，以便跳转后使用
    sessionStorage.setItem('wtab_pending_bookmarks', JSON.stringify(checkedBookmarks.value));
    
    // 使用 Chrome API 打开新标签页
    chrome.tabs.create({ url: 'chrome://newtab/' });
    return;
  }

  // 获取待添加的书签数据（可能是从其他页面跳转过来的）
  const pendingBookmarks = sessionStorage.getItem('wtab_pending_bookmarks');
  const bookmarksToSave = pendingBookmarks ? JSON.parse(pendingBookmarks) : checkedBookmarks.value;
  
  try {
    // 保存到 localStorage
    localStorage.setItem('wtab_bookmarks', JSON.stringify(bookmarksToSave));
    
    // 清除临时存储
    sessionStorage.removeItem('wtab_pending_bookmarks');
    
    // 提示用户保存成功
    ElMessage.success('书签已成功添加到 WTab');
  } catch (error) {
    console.error('保存书签失败:', error);
    ElMessage.error('保存书签失败，请重试');
  }
};

/**
 * 选择书签
 */
const handleCheck = (_data: TreeDataNode, info: CheckedInfo): void => {
  checkedBookmarks.value = info.checkedNodes;
};

/**
 * 获取书签
 */
const getBookmarks = async (): Promise<void> => {
  loading.value = true;
  try {
    const result = (await getChromeBookmarks()) as TreeDataNode[];
    bookmarks.value = await recursiveChange<TreeDataNode, ChangedTreeData>(
      result[0].children!,
      transformBookmark
    );
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

getBookmarks();
</script>

<template>
  <div class="w-96 max-h-[600px] min-h-[300px] flex flex-col overflow-hidden">
    {{ checkedBookmarks }}
    <el-tree
      v-loading="loading"
      :data="bookmarks"
      class="px-4 flex-1 overflow-y-auto"
      node-key="id"
      show-checkbox
      :props="treeProps"
      @check="handleCheck"
    >
      <template #default="{ node }">
        <component
          :is="node.data.type === 'link' ? Earth : Folder"
          class="text-black flex-shrink-0"
          style="height: 1em; width: 1em"
        />
        <span :title="node.label" class="ml-0.5 text-black truncate">
          {{ node.label }}
        </span>
      </template>
    </el-tree>
    <el-button
      type="primary"
      round
      @click="handleExportBookmarks"
      :disabled="!checkedBookmarks.length"
      class="!py-6"
      >添加到 WTab
    </el-button>
  </div>
</template>
