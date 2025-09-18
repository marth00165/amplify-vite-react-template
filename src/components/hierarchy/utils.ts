// import { Node } from './types';

// export function _buildTree(flat: Node[]) {
//   /*
//     Input:

//     Flat array of nodes, each with {id, name, parentId, order}.

//     children may or may not exist (ignore if present).

//     Output:

//     Array of root nodes (where parentId === null).

//     Each node has a children: Node[] property filled in (sorted by order).

//     Hierarchy is nested correctly all the way down.

//     Responsibilities:

//     Group nodes by parentId.

//     Attach them as children under their parent.

//     Ensure siblings are sorted by order.

//     Return only the roots array.

//     */

//   const nodesById = new Map<string, Node>();
//   const roots: Node[] = [];

//   for (const node of flat) {
//     nodesById.set(node.id, { ...node, children: [] });
//   }


//   for (const node of nodesById.values()){
//      if (node.parentId === null) {
//       roots.push(nodesById.get(node.id)!);
//     }

//     if (node.parentId !== null) {
//       const parent = nodesById.get(node.parentId);
//       if (parent) {
//         parent.children!.push(nodesById.get(node.id)!);
//       } else {
//         node.parentId = null;
//         roots.push(nodesById.get(node.id)!);
//       }
//     }
//   }

//   const sortedRoots = _sortSiblings(roots);
//   return sortedRoots;
// }

// export function _flattenTree() {
//   // function implementation
// }

// export function _validateOrphans(flat) {
//   // function implementation
//   console.log(flat);
// }

// export function _sortSiblings(nodes) {
//   // function implementation
// }
