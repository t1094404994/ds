import BinNode, { IsLChild, IsRChild, stature } from "./BinNode";
/**
 * 二叉树
 */
export default class BinTree<T> {
  //规模
  protected _size: number;
  protected _root: BinNode<T> | null;
  constructor() {
    this._size = 0;
    this._root = null;
  }

  /** protected */
  //更新节点x的高度
  protected updateHeight(x: BinNode<T>): number {
    return (x.height = 1 + Math.max(stature(x.lChild), stature(x.rChild)));
  }
  //更新节点x及其祖先的高度
  protected updateHeightAbove(x: BinNode<T>) {
    while (x) {
      const old = x.height;
      const newH = this.updateHeight(x);
      if (old === newH) {
        break;
      }
      x = x.parent!;
    }
  }

  /** public */
  public empty(): boolean {
    return this._size === 0;
  }

  get size() {
    return this._size;
  }
  get root() {
    return this._root;
  }

  //插入根节点
  public insertAsRoot(e: T) {
    this.dispose();
    this._size = 1;
    this._root = new BinNode<T>(e);
  }
  //e作为x的左孩子(原无)插入
  public insertAsLC(x: BinNode<T>, e: T): BinNode<T> {
    this._size++;
    x.insertAsLC(e);
    this.updateHeightAbove(x);
    return x.lChild!;
  }
  //e作为x的右孩子(原无)插入
  public insertAsRC(x: BinNode<T>, e: T): BinNode<T> {
    this._size++;
    x.insertAsRC(e);
    this.updateHeightAbove(x);
    return x.rChild!;
  }
  //S作为x的左子树接入
  public attachAsLC(x: BinNode<T>, S: BinTree<T>): BinNode<T> {
    if ((x.lChild = S._root)) x.lChild.parent = x;
    this._size += S._size;
    this.updateHeightAbove(x);
    return x;
  }
  //S作为x的右子树接入
  public attachAsRC(x: BinNode<T>, S: BinTree<T>): BinNode<T> {
    if ((x.rChild = S._root)) x.rChild.parent = x;
    this._size += S._size;
    this.updateHeightAbove(x);
    return x;
  }

  //删除以位置x处节点为根的子树,返回该子树原先的规模
  public removeTree(x: BinNode<T>): number {
    if (!x.parent) return 0;
    if (IsLChild(x)) x.parent.lChild = null;
    else if (IsRChild(x)) x.parent.rChild = null;
    this.updateHeightAbove(x.parent);
    const n = this.removeTreeAt(x);
    this._size -= n;
    return n;
  }

  //删除二叉树中位置x处的节点及其后代,返回被删除节点的数值
  public removeTreeAt(x: BinNode<T> | null): number {
    if (!x) return 0;
    const n = 1 + this.removeTreeAt(x.lChild) + this.removeTreeAt(x.rChild);
    x.dispose();
    return n;
  }

  //层次遍历
  public travLevel(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this._root.travLevel(visit);
    }
  }
  //先序遍历
  public travPre(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this._root.travPre(this._root, visit);
    }
  }
  //中序遍历
  public travIn(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this._root.travIn_I3(this._root, visit);
    }
  }
  //后序遍历
  public travPost(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this._root.travPost(this._root, visit);
    }
  }

  public dispose() {
    this._size = 0;
    if (this._root) {
      this._root.travLevel((node) => {
        node.dispose();
      });
    }
    this._root = null;
  }
}
