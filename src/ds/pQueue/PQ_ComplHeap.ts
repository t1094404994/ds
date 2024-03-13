/**
 * 优先级队列-完全二叉堆
 */

import { swapArrayData } from "@/util/common";

//判断PQ[i]是否合法
function InHeap(n: number, i: number) {
  return i >= 0 && i < n;
}
//PQ[i]的父节点
function Parent(i: number) {
  return (i - 1) >> 1;
}
//最后一个内部节点
function LastInternal(n: number) {
  return Parent(n - 1);
}
//PQ[i]的左孩子
function LChild(i: number) {
  return 1 + (i << 1);
}
//PQ[i]的右孩子
function RChild(i: number) {
  return (1 + i) << 1;
}
//判断PQ[i]是否有父亲
function ParentValid(i: number) {
  return i > 0;
}
//判断PQ[i]是否有一个(左)孩子
function LChildValid(n: number, i: number) {
  return InHeap(n, LChild(i));
}
//判断PQ[i]是否有两个孩子
function RChildValid(n: number, i: number) {
  return InHeap(n, RChild(i));
}

enum CompareResult {
  LessThan,
  Equal,
  GreaterThan,
}
//比较函数
type CompareFun<T> = (a: T, b: T) => CompareResult;

export class PQ_ComplHeap<T> {
  private _elem: Array<T>;
  private compareFun: CompareFun<T>;
  constructor(compareFun: CompareFun<T>, A?: Array<T>, n?: number) {
    this.compareFun = compareFun;
    this._elem = [];
    if (A && n) {
      //TODO 增加可选参数 是否浅拷贝数组
      this._elem = A;
      this.heapify(n);
    }
  }
  //取大者,等时前者优先
  protected bigger(i: number, j: number) {
    return this.compareFun(this._elem[i], this._elem[j]) ===
      CompareResult.GreaterThan
      ? i
      : j;
  }
  //父子三者中的大者
  protected properParent(n: number, i: number) {
    return RChildValid(n, i)
      ? this.bigger(i, this.bigger(LChild(i), RChild(i)))
      : LChildValid(n, i)
      ? this.bigger(i, LChild(i))
      : i;
  }
  //下滤
  protected percolateDown(n: number, i: number) {
    let j = 0;
    while (i !== (j = this.properParent(n, i))) {
      //如果没有左右孩子大，则和最大的孩子交换
      swapArrayData(this._elem, i, j);
      i = j;
    }
    return i;
  }
  //上滤
  protected percolateUp(i: number) {
    while (ParentValid(i)) {
      const j = Parent(i);
      //小于父节点则不需要上滤
      if (
        this.compareFun(this._elem[i], this._elem[j]) === CompareResult.LessThan
      ) {
        break;
      }
      //否则交换
      swapArrayData(this._elem, i, j);
      i = j;
    }
    return i;
  }
  //Floyd建堆算法
  protected heapify(n: number) {
    for (let i = LastInternal(n); InHeap(n, i); i--) {
      this.percolateDown(n, i);
    }
  }

  //插入
  public insert(e: T) {
    //将新元素插入堆底
    this._elem.push(e);
    //上滤
    this.percolateUp(this._elem.length - 1);
  }
  //读取优先级最高的词条
  public getMax(): T {
    return this._elem[0];
  }
  //删除优先级最高的词条
  public delMax(): T {
    if (this._elem.length === 0) throw new Error("堆为空");
    else if (this._elem.length === 1) return this._elem.pop()!;
    //摘除堆顶,代之以末词条
    const maxElem = this._elem[0];
    this._elem[0] = this._elem.pop()!;
    //对新堆顶实施下滤
    this.percolateDown(this._elem.length - 1, 0);
    return maxElem;
  }

  public empty() {
    return this._elem.length === 0;
  }

  public dispose() {
    this._elem = null as unknown as Array<T>;
    this.compareFun = null as unknown as CompareFun<T>;
  }
}
