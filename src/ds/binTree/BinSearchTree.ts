/**
 * 二叉搜索树
 * 可以存在重复的key
 */
import BinTree from "./BinTree";
import BinNode, { HasLChild, HasRChild, IsLChild, IsRChild } from "./BinNode";
import Entry, { K as Key } from "../entry/Entry";

export default class BinSearchTree<K> extends BinTree<Entry<K>> {
  //search最后访问的非空节点
  protected _hot: BinNode<Entry<K>> | null = null;
  //按照3+4结构,联接3个节点及4棵子树
  protected connect34(
    a: BinNode<Entry<K>>,
    b: BinNode<Entry<K>>,
    c: BinNode<Entry<K>>,
    t0: BinNode<Entry<K>> | null,
    t1: BinNode<Entry<K>> | null,
    t2: BinNode<Entry<K>> | null,
    t3: BinNode<Entry<K>> | null
  ): BinNode<Entry<K>> {
    if (t0) {
      t0.parent = a;
    }
    if (t1) {
      t1.parent = a;
    }
    if (t2) {
      t2.parent = c;
    }
    if (t3) {
      t3.parent = c;
    }
    a.lChild = t0;
    a.rChild = t1;
    this.updateHeight(a);
    c.lChild = t2;
    c.rChild = t3;
    this.updateHeight(c);
    b.lChild = a;
    a.parent = b;
    b.rChild = c;
    c.parent = b;
    this.updateHeight(b);
    return b;
  }

  //BST节点旋转变换统一算法
  protected rotateAt(v: BinNode<Entry<K>>): BinNode<Entry<K>> {
    const p = v.parent!;
    const g = p.parent!;
    if (IsLChild(p)) {
      if (IsLChild(v)) {
        this.replaceParent(p, g);
        return this.connect34(v, p, g, v.lChild, v.rChild, p.rChild, g.rChild);
      } else {
        this.replaceParent(v, g);
        return this.connect34(p, v, g, p.lChild, v.lChild, v.rChild, g.rChild);
      }
    } else {
      if (IsRChild(v)) {
        this.replaceParent(p, g);
        return this.connect34(g, p, v, g.lChild, p.lChild, v.lChild, v.rChild);
      } else {
        this.replaceParent(v, g);
        return this.connect34(g, v, p, g.lChild, v.lChild, v.rChild, p.rChild);
      }
    }
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

  //查找
  public search(e: Key, equalReturn: boolean = true): BinNode<Entry<K>> | null {
    this._hot = null;
    return this.searchIn(this._root, e, equalReturn);
  }

  //在以v为根的BST子树中查找关键码e
  public searchIn(
    v: BinNode<Entry<K>> | null,
    e: Key,
    equalReturn: boolean = true
  ): BinNode<Entry<K>> | null {
    while (1) {
      if (
        !v ||
        (equalReturn && BinNode.Equal(e, v.data.key, this.comparerEqual))
      ) {
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
    this.search(e.key, false);
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
    this.removeAt(x);
    this._size--;
    this.updateHeightAbove(this._hot!);
    return true;
  }

  //TODO 删除全部

  public removeAt(x: BinNode<Entry<K>>): BinNode<Entry<K>> | null {
    let w = x;
    let succ: BinNode<Entry<K>> | null = null;
    if (!HasLChild(x)) {
      succ = x.rChild;
    } else if (!HasRChild(x)) {
      succ = x.lChild;
    } else {
      w = this.succ(w)!;
      const warp = w.data;
      w.data = x.data;
      x.data = warp;
      succ = w.rChild;
    }
    this._hot = w.parent;
    if (succ) {
      succ.parent = this._hot;
      if (this._hot && IsLChild(w)) {
        this._hot.lChild = succ;
      } else if (this._hot && IsRChild(w)) {
        this._hot.rChild = succ;
      }
    }
    w.dispose();
    //没有父节点则说明删除的是根节点
    if (!this._hot) {
      this._root = succ;
    }
    return succ;
  }
}
