type CompareFunction<T> = (a: T, b: T) => boolean;
export enum RBColor {
  RB_RED,
  RB_BLACK,
}

//节点高度 空树高度为-1
export function stature<T>(x: BinNode<T> | null): number {
  return x ? x.height : -1;
}

export function IsRoot<T>(x: BinNode<T>): boolean {
  return !x.parent;
}
export function IsLChild<T>(x: BinNode<T>): boolean {
  return !IsRoot(x) && x.parent?.lChild === x;
}
export function IsRChild<T>(x: BinNode<T>): boolean {
  return !IsRoot(x) && x.parent?.rChild === x;
}
export function HasParent<T>(x: BinNode<T>): boolean {
  return !IsRoot(x);
}
export function HasLChild<T>(x: BinNode<T>): boolean {
  return x.lChild !== null;
}
export function HasRChild<T>(x: BinNode<T>): boolean {
  return x.rChild !== null;
}
export function HasChild<T>(x: BinNode<T>): boolean {
  return HasLChild(x) || HasRChild(x);
}
export function HasBothChild<T>(x: BinNode<T>): boolean {
  return HasLChild(x) && HasRChild(x);
}
export function IsLeaf<T>(x: BinNode<T>): boolean {
  return !HasChild(x);
}
export function uncle<T>(x: BinNode<T>): BinNode<T> | null {
  //如果没有父节点,则没有叔叔
  if (!x.parent) {
    return null;
  }
  //如果没有祖父节点,则没有叔叔
  if (!x.parent.parent) {
    return null;
  }
  //如果父节点是祖父节点的左孩子,则叔叔是右孩子
  if (IsLChild(x.parent)) {
    return x.parent.parent.rChild;
  } else {
    //如果父节点是祖父节点的右孩子,则叔叔是左孩子
    return x.parent.parent.lChild;
  }
}
//切换父节点的引用
export function CutParentTo<T>(x: BinNode<T>) {
  if (IsRoot(x)) {
    return;
  }
  if (IsLChild(x)) {
    x.parent!.lChild = null;
  } else {
    x.parent!.rChild = null;
  }
  x.parent = null;
}
//替换x的父节点为p的父节点
export function ReplaceParent<T>(x: BinNode<T>, p: BinNode<T>) {
  if (IsRoot(x)) {
    return;
  }
  //切除原来的父节点引用
  if (x.parent) {
    IsLChild(x) ? (x.parent.lChild = null) : (x.parent.rChild = null);
  }
  x.parent = p.parent;
  //变更现在的父节点的引用
  if (x.parent) {
    if (IsLChild(x)) {
      x.parent!.lChild = x;
    } else {
      x.parent!.rChild = x;
    }
  }
  p.parent = null;
}
//理想平衡条件
export function Balanced<T>(x: BinNode<T>): boolean {
  return stature(x.lChild) === stature(x.rChild);
}
//平衡因子
export function BalFac<T>(x: BinNode<T>): number {
  return stature(x.lChild) - stature(x.rChild);
}
//AVL平衡条件
export function AvlBalanced<T>(x: BinNode<T>): boolean {
  return Math.abs(BalFac(x)) <= 1;
}
//在左右孩子中取更高者，若等高，取与父同侧者
export function tallerChild<T>(x: BinNode<T>): BinNode<T> | null {
  if (stature(x.lChild) > stature(x.rChild)) {
    return x.lChild;
  } else if (stature(x.lChild) < stature(x.rChild)) {
    return x.rChild;
  } else if (IsLChild(x)) {
    return x.lChild;
  } else {
    return x.rChild;
  }
}

/**
 * 二叉树节点
 */
export default class BinNode<T> {
  //数据
  public data: T;
  //父节点
  public parent: BinNode<T> | null;
  //左节点
  public lChild: BinNode<T> | null;
  //右节点
  public rChild: BinNode<T> | null;
  //高度
  public height: number;
  //颜色
  public color: RBColor;
  constructor(
    data: T,
    parent: BinNode<T> | null = null,
    lChild: BinNode<T> | null = null,
    rChild: BinNode<T> | null = null,
    height: number = 0,
    color: RBColor = RBColor.RB_RED
  ) {
    this.data = data;
    this.parent = parent;
    this.lChild = lChild;
    this.rChild = rChild;
    this.height = height;
    this.color = color;
  }

  //子树规模
  get size(): number {
    return 0;
  }

  //作为左孩子插入
  public insertAsLC(e: T) {
    //先清除原孩子的引用关系
    if (this.lChild) {
      this.lChild.dispose();
    }
    this.lChild = new BinNode<T>(e, this);
  }

  //作为右孩子插入
  public insertAsRC(e: T) {
    //先清除原孩子的引用关系
    if (this.rChild) {
      this.rChild.dispose();
    }
    this.rChild = new BinNode<T>(e, this);
  }

  //小于判断
  public static Less<T>(a: T, b: T, comparer?: CompareFunction<T>): boolean {
    if (comparer) {
      return comparer(a, b);
    }
    return a < b;
  }

  //大于判断
  public static Greater<T>(a: T, b: T, comparer?: CompareFunction<T>): boolean {
    if (comparer) {
      return comparer(a, b);
    }
    return a > b;
  }

  //等于判断
  public static Equal<T>(a: T, b: T, comparer?: CompareFunction<T>): boolean {
    if (comparer) {
      return comparer(a, b);
    }
    return a === b;
  }

  //不等于判断
  public static NotEqual<T>(
    a: T,
    b: T,
    comparer?: CompareFunction<T>
  ): boolean {
    if (comparer) {
      return !comparer(a, b);
    }
    return a !== b;
  }

  public dispose() {
    if (IsLChild(this)) {
      this.parent!.lChild = null;
    } else if (IsRChild(this)) {
      this.parent!.rChild = null;
    }
    this.parent = null;
    this.lChild = null;
    this.rChild = null;
    this.height = 0;
    this.data = null!;
  }
}
