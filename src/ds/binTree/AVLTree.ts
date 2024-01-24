import BinSearchTree from "./BinSearchTree";
import BinNode, { AvlBalanced, tallerChild } from "./BinNode";
import Entry, { K } from "../entry/Entry";

export default class AVLTree<T> extends BinSearchTree<T> {
  //AVL插入
  public insert(e: Entry<T>): BinNode<Entry<T>> {
    this.search(e.key);
    if (!this._root) {
      this.insertAsRoot(e);
      return this._root!;
    } else {
      const x = new BinNode<Entry<T>>(e, this._hot);
      if (BinNode.Less(e.key, this._hot!.data.key, this.comparerLess)) {
        this._hot!.lChild = x;
      } else {
        this._hot!.rChild = x;
      }
      this._size++;
      //AVL树重平衡
      for (let g = this._hot; g; g = g!.parent) {
        if (!AvlBalanced(g)) {
          g = this.rotateAt(tallerChild(tallerChild(g)!)!)!;
          //插入操作只需调整一次
          break;
        } else {
          this.updateHeight(g!);
        }
      }
      return x;
    }
  }
  //AVL树删除
  public remove(e: K): boolean {
    const x = this.search(e);
    if (!x) return false;
    this.removeAt(x);
    this._size--;
    //向上逐层检查
    for (let g = this._hot; g; g = g!.parent) {
      if (!AvlBalanced(g)) {
        g = this.rotateAt(tallerChild(tallerChild(g)!)!)!;
      }
      this.updateHeight(g!);
    }
    return true;
  }
  //TODO 删除全部
}
