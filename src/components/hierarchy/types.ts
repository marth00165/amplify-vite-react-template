export type NodeId = string;


export interface Node {
  id: string;
  name: string;
  parentId: string | null; // null = root
  order: number;           // position among siblings (0…n-1)
  children?: Node[];       // only when building a tree
}





