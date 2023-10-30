/**
 * 红黑树
 */
import BinNode from "./BinNode";
import BinSearchTree from "./BinSearchTree";
import Entry, { K as Key } from "../entry/Entry";
export default class BlackRedTree<T> extends BinSearchTree<T> {
  //双黑修正
  public solveDoubleRed(x: BinNode<T>): void {
    //
  }
  //双红修正
  public solveDoubleBlack(x: BinNode<T>): void {
    //
  }

  //更新高度
  public updateHeight(x: BinNode<T>): number {
    return 0;
  }

  //插入(重写)
  public insert(e: T): BinNode<T> {
    return x;
  }
}
