<script lang="ts" setup>
import { getChromeBookmarks } from "@/utils/chrome";
import { recursiveChange, transformBookmark } from "@/utils/tree";
import type { ChangedTreeData, TreeDataNode, CheckedInfo } from "@/types";
import { Earth, Folder } from "@/components/icons";
import { ElMessage } from "element-plus";
import { nanoid } from 'nanoid/non-secure'

const loading = ref<boolean>(false);
const bookmarks = shallowRef<TreeDataNode[]>([]);
const checkedBookmarks = ref<TreeDataNode[]>([]);

const treeProps = {
  value: "id",
  label: "title",
  children: "children",
  icon: "icon",
} as const;

export interface Widget {
  id: string
  icon: string
  name: string
  url: string
}


function waitForMessageOnce(expectedType: string): Promise<any> {
  return new Promise((resolve) => {
    function handler(message: any) {
      if (message?.type === expectedType) {
        chrome.runtime.onMessage.removeListener(handler);
        resolve(message);
      }
    }
    chrome.runtime.onMessage.addListener(handler);
  });
}
/**
 * 导出书签
 */
const handleExportBookmarks = async (): Promise<void> => {
  console.log('Export bookmarks clicked');

  // 获取当前标签页信息
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isNewTab = currentTab.url === 'chrome://newtab/';
  console.log('Is new tab:', isNewTab);

  const bookmarksToSend: Widget[] = []
  checkedBookmarks.value.forEach(item => {
    if (!item.url) return
    bookmarksToSend.push({
      "icon": `https://logo.clearbit.com/${item.url}`,
      "id": nanoid(),
      "name": item.title || '未知',
      "url": item.url
    })
  });
  if (!bookmarksToSend.length) {
    ElMessage.warning('无可添加书签')
    return
  };
  console.log('待发送书签', bookmarksToSend)

  if (isNewTab) {
    try {
      chrome.runtime.sendMessage({
        type: 'SEND_TO_IFRAME',
        payload: {
          bookmarks: bookmarksToSend,
        }
      });

      const { payload } = await waitForMessageOnce("FROM_WTAB_IFRAME")
      if (payload === '保存书签失败！打开新页面后重试！') {
        ElMessage.error(payload);
      } else {
        ElMessage.success(payload);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      ElMessage.error('操作失败，请重试');
    }
    return;
  }


  // 不在新标签页，保存数据并打开新标签页
  try {
    // 将数据临时存储到 chrome.storage.session
    await chrome.storage.session.set({ 'wtab_pending_bookmarks': bookmarksToSend });

    // 打开新标签页
    chrome.tabs.create({ url: 'chrome://newtab/' });
    console.log('New tab opened');

    // 提示用户
    ElMessage.success('正在打开新标签页...');
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请重试');
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
    <el-tree v-loading="loading" :data="bookmarks" class="px-4 flex-1 overflow-y-auto" node-key="id" show-checkbox
      :props="treeProps" @check="handleCheck">
      <template #default="{ node }">
        <component :is="node.data.type === 'link' ? Earth : Folder" class="text-black flex-shrink-0"
          style="height: 1em; width: 1em" />
        <span :title="node.label" class="ml-0.5 text-black truncate">
          {{ node.label }}
        </span>
      </template>
    </el-tree>
    <el-button type="primary" round @click="handleExportBookmarks" :disabled="!checkedBookmarks.length"
      class="!py-6">添加到
      WTab
    </el-button>
  </div>
</template>
