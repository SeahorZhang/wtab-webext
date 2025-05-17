export interface TreeDataNode {
  id: string;
  title?: string;
  parentId?: string;
  url?: string;
  children?: TreeDataNode[];
  type?: string;
  icon?: string;
}

export interface ChangedTreeData extends TreeDataNode {
  type: 'folder' | 'link';
  title: string;
}

export interface BookmarkNode {
  type: 'folder' | 'link';
  title: string;
  dateAdded: number;
  url?: string;
  icon?: string;
  children?: BookmarkNode[];
}

export interface BookmarkChildren {
  id: string;
  title: string;
  url?: string;
  type: 'folder' | 'link';
  icon?: string;
}

export interface ResultData {
  title: string;
  description: string;
  icon: string;
}

export interface CheckedInfo {
  checkedNodes: TreeDataNode[];
  checkedKeys: string[];
  halfCheckedNodes: TreeDataNode[];
  halfCheckedKeys: string[];
}