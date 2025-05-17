export default defineBackground({
  main() {
    // 监听标签页创建
    chrome.tabs.onCreated.addListener(async (tab) => {
      // 等待标签页加载完成
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        // 移除监听器
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);


          // 检查是否有待添加的书签数据
          chrome.storage.session.get(['wtab_pending_bookmarks']).then(async (result) => {
            const pendingBookmarks = result.wtab_pending_bookmarks;
            if (!(pendingBookmarks && pendingBookmarks.length)) return
            try {
              // 等待一段时间，确保 content script 加载完成
              await new Promise(resolve => setTimeout(resolve, 500));

              chrome.runtime.sendMessage({
                type: 'SEND_TO_IFRAME',
                payload: {
                  bookmarks: pendingBookmarks,
                }
              });

              // 清除临时存储
              await chrome.storage.session.remove(['wtab_pending_bookmarks']);
            } catch (error) {
              chrome.runtime.sendMessage({
                type: "FROM_WTAB_IFRAME",
                payload: '保存书签失败！打开新页面后重试！',
              });
            }
          }).catch(error => {
            console.error('Failed to get pending bookmarks:', error);
          });
        }
      });
    });
  }
}); 