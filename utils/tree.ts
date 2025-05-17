import type { ChangedTreeData, TreeDataNode } from "@/types";

/**
 * 递归转换树形结构数据
 * @param items 源数据数组
 * @param transform 转换函数，用于处理每个节点
 * @param childKey 子节点的键名，默认为 'children'
 * @returns 转换后的树形结构数组
 * @example
 * const result = await recursiveChange(data, async (item) => ({
 *   ...item,
 *   type: item.children ? 'folder' : 'file'
 * }));
 */
export const recursiveChange = async <T, U>(
  items: T[],
  transform: (item: T) => Promise<U>,
  childKey: string = 'children'
): Promise<U[]> => {
  return Promise.all(items.map(async (item) => {
    const transformed = await transform(item);
    if ((item as any)[childKey]) {
      (transformed as any)[childKey] = await recursiveChange((item as any)[childKey], transform);
    }
    return transformed;
  }));
};

/**
 * 递归构建树形结构
 * @param list 扁平的数据数组
 * @param rootValue 根节点的 parentId 值，默认为 "0"
 * @returns 树形结构数组
 * @example
 * const tree = recursiveFind(flatArray);
 */
export const recursiveFind = <T extends { parentId?: string, children?: T[], id: string, type?: string, title?: string, dateAdded?: number, url?: string }>(
  list: T[],
  rootValue = "0"
) => {
  const result: Omit<T, 'id' | 'parentId'>[] = [];
  for (let i = 0; i < list.length; i++) {
    const originalItem = list[i];
    if (originalItem.parentId !== rootValue) continue;

    if (originalItem.type === 'folder') {
      const children = recursiveFind(list, originalItem.id);
      result.push({
        type: originalItem.type,
        title: originalItem.title || '',
        dateAdded: originalItem.dateAdded || 0,
        children: children.length ? children : undefined,
      } as unknown as Omit<T, 'id' | 'parentId'>);
    } else {
      result.push({
        type: originalItem.type,
        title: originalItem.title || '',
        dateAdded: originalItem.dateAdded || 0,
        url: originalItem.url,
        icon: getClearbitLogoUrl(originalItem.url || ''),
      } as unknown as Omit<T, 'id' | 'parentId'>);
    }
  }
  return result;
};

/**
 * 将书签数据转换为树形结构
 * @param item 书签节点
 * @returns 转换后的书签节点
 */
export const transformBookmark = async (item: TreeDataNode): Promise<ChangedTreeData> => ({
  ...item,
  title: item.title || '',
  type: item?.children ? "folder" : "link",
});

// 获取 logo URL
export const getClearbitLogoUrl = (url: string) => {
  if (!url) return '';
  const parsedUrl = new URL(url);
  return `https://icon.horse/icon/${parsedUrl.hostname}`;
};
