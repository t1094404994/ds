/**
 * 二叉搜索树
 */
import BinTree from "./BinTree";
import BinNode, { HasLChild, HasRChild, IsLChild, IsRChild } from "./BinNode";
import Entry, { K as Key } from "../entry/Entry";

export default class BinSearchTree<K> extends BinTree<Entry<K>> {
  //search最后访问的非空节点
  protected _hot: BinNode<Entry<K>> | null = null;
  //按照3+4结构,联接3个节点及4棵子树
  protected connect34() {
    //
  }

  protected comparerEqual(a: Key, b: Key): boolean {
    return a === b;
  }
  protected comparerLess(a: Key, b: Key): boolean {
    return a < b;
  }
  protected comparerGreater(a: Key, b: Key): boolean {
    return a > b;
  }
  protected comparerNotEqual(a: Key, b: Key): boolean {
    return a !== b;
  }

  // //对x及其父亲,祖父做统一旋转调整
  // protected rotateAt(x: BinNode<Entry<K>>):void
  //查找
  public search(e: Key): BinNode<Entry<K>> | null {
    this._hot = null;
    return this.searchIn(this._root, e);
  }

  //在以v为根的BST子树中查找关键码e
  public searchIn(
    v: BinNode<Entry<K>> | null,
    e: Key
  ): BinNode<Entry<K>> | null {
    while (1) {
      if (!v || BinNode.Equal(e, v.data.key, this.comparerEqual)) {
        break;
      }
      this._hot = v;
      v = BinNode.Less(e, v.data.key, this.comparerLess) ? v.lChild : v.rChild;
    }
    return v;
  }

  //插入
  public insert(e: Entry<K>): BinNode<Entry<K>> {
    //搜索key并设置_hot
    const x = this.search(e.key);
    if (x) {
      return x;
    }
    if (!this._root) {
      this.insertAsRoot(e);
      return this._root!;
    } else {
      const node = new BinNode<Entry<K>>(e, this._hot);
      if (BinNode.Less(e.key, this._hot!.data.key, this.comparerLess)) {
        this._hot!.lChild = node;
      } else {
        this._hot!.rChild = node;
      }
      this._size++;
      this.updateHeightAbove(node);
      return node;
    }
  }

  //删除
  public remove(e: Key): boolean {
    const x = this.search(e);
    if (!x) {
      return false;
    }
    this.removeAt(x, this._hot);
    this._size--;
    this.updateHeightAbove(this._hot!);
    return true;
  }

  public removeAt(
    x: BinNode<Entry<K>>,
    hot: BinNode<Entry<K>> | null
  ): BinNode<Entry<K>> | null {
    let w = x;
    let succ: BinNode<Entry<K>> | null = null;
    if (!HasLChild(x)) {
      succ = x = x.rChild!;
    } else if (!HasRChild(x)) {
      succ = x = x.lChild!;
    } else {
      //随机使用前驱或后继 消除移除过程中的偏斜
      w = Math.random() ? w.succ(w)! : w.pred(w)!;
      const warp = w.data;
      w.data = x.data;
      x.data = warp;
      const u = w.parent!;
      if (BinNode.Equal(u.data.key, x.data.key, this.comparerEqual)) {
        u.rChild = succ = w.rChild;
      } else {
        u.lChild = succ = w.rChild;
      }
    }
    hot = w.parent;
    if (succ) {
      succ.parent = hot;
      if (hot && IsLChild(w)) {
        hot.lChild = succ;
      } else if (hot && IsRChild(w)) {
        hot.rChild = succ;
      }
    }
    w.dispose();
    //没有父节点则说明删除的是根节点
    if (!hot) {
      this._root = succ;
    }
    return succ;
  }
}
