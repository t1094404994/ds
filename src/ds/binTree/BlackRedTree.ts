/**
 * 红黑树
 * 1.树根始终为黑色
 * 2.外部节点均为黑色
 * 3.红节点的孩子必为黑
 * 4.任一节点到跟节点的沿途,黑节点的数目相同
 */
import BinNode, { RBColor, stature } from "./BinNode";
import BinSearchTree from "./BinSearchTree";
import Entry from "../entry/Entry";

//判断节点是否为黑色
function IsBlack<T>(p: BinNode<T> | null): boolean {
  //外部节点也视作黑节点
  return !p || p.color === RBColor.RB_BLACK;
}
//判断节点是否为红色
function IsRed<T>(p: BinNode<T> | null): boolean {
  return !IsBlack(p);
}
//更新高度
function BlackUpdateHeight<T>(x: BinNode<Entry<T>>) {
  stature(x.lChild) == stature(x.rChild) &&
    x.height == (IsRed(x) ? stature(x.lChild) : stature(x.lChild) + 1);
}

export default class BlackRedTree<T> extends BinSearchTree<T> {
  //双红修正
  private solveDoubleRed(x: BinNode<Entry<T>>): void {
    //
  }
  //双黑修正
  private solveDoubleBlack(x: BinNode<Entry<T>>): void {
    //
  }

  //更新高度
  public updateHeight(x: BinNode<Entry<T>>): number {
    x.height = Math.max(stature(x.lChild), stature(x.rChild));
    return IsBlack(x) ? x.height++ : x.height;
  }

  //插入(重写)
  public insert(e: Entry<T>): BinNode<Entry<T>> {
    let x = this.search(e.key);
    //TODO:重复元素处理
    if (x) return x;
    x = new BinNode<Entry<T>>(e, this._hot);
    this.solveDoubleRed(x);
    return x;
  }
}
