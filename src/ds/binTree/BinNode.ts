import Queue from "../queue/Queue";

enum RBColor {
  RB_RED,
  RB_BLACK,
}

type VSTFunction<T> = (node: BinNode<T>) => void;
type CompareFunction<T> = (a: T, b: T) => boolean;

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
  constructor(data: T, parent: BinNode<T> | null = null) {
    this.data = data;
    this.parent = parent;
    this.lChild = null;
    this.rChild = null;
    this.height = 0;
    this.color = RBColor.RB_RED;
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

  //取节点的直接后继 (中序遍历意义下)
  public succ(s: BinNode<T>): BinNode<T> | null {
    //如果有右孩子,则直接后继必在右子树中
    if (s.rChild) {
      s = s.rChild;
      while (s.lChild) {
        s = s.lChild;
      }
    } else {
      //否则,直接后继应是"将s包含于其左子树中的最低祖先"
      while (IsRChild(s)) s = s.parent!;
      s = s.parent!;
    }
    return s;
  }
  //取节点的直接前驱 (中序遍历意义下)
  public pred(s: BinNode<T>): BinNode<T> | null {
    //如果有左孩子,则直接前驱必在左子树中
    if (s.lChild) {
      s = s.lChild;
      while (s.rChild) {
        s = s.rChild;
      }
    } else {
      //否则,直接前驱应是"将s包含于其右子树中的最低祖先"
      while (IsLChild(s)) s = s.parent!;
      s = s.parent!;
    }
    return s;
  }
  //层次遍历
  public travLevel(VST: VSTFunction<T>) {
    //队列
    const queue: Queue<BinNode<T>> = new Queue<BinNode<T>>();
    queue.enqueue(this);
    while (!queue.empty()) {
      const node = queue.dequeue()!;
      if (node.lChild) {
        queue.enqueue(node.lChild);
      }
      if (node.rChild) {
        queue.enqueue(node.rChild);
      }
      //最后访问 防止dispose后找不到左右孩子
      VST(node);
    }
  }

  //沿左分支持续深入,直至没有左分支的节点
  private visitAlongLeftBranch(
    x: BinNode<T> | null,
    VST: VSTFunction<T>,
    stack: BinNode<T>[]
  ) {
    while (x) {
      VST(x);
      if (x.rChild) {
        stack.push(x.rChild);
      }
      x = x.lChild;
    }
  }
  //先序遍历
  public travPre(x: BinNode<T>, VST: VSTFunction<T>) {
    const stack: Array<BinNode<T>> = [];
    while (x) {
      this.visitAlongLeftBranch(this, VST, stack);
      if (stack.length === 0) {
        break;
      }
      x = stack.pop()!;
    }
  }

  //沿左分支不断深入,直至没有左分支的节点
  private goAlongLeftBranch(x: BinNode<T> | null, stack: BinNode<T>[]) {
    while (x) {
      stack.push(x);
      x = x.lChild;
    }
  }
  //中序遍历 V1
  public travIn_I1(_x: BinNode<T>, VST: VSTFunction<T>) {
    const stack: Array<BinNode<T>> = [];
    let x: BinNode<T> | null = _x;
    while (true) {
      this.goAlongLeftBranch(x, stack);
      if (stack.length === 0) {
        break;
      }
      x = stack.pop()!;
      VST(x);
      x = x.rChild;
    }
  }
  //中序遍历 V2
  public travIn_I2(_x: BinNode<T>, VST: VSTFunction<T>) {
    const stack: Array<BinNode<T>> = [];
    let x: BinNode<T> | null = _x;
    while (true) {
      if (x) {
        stack.push(x);
        x = x.lChild;
      } else if (stack.length) {
        x = stack.pop()!;
        VST(x);
        x = x.rChild;
      } else {
        break;
      }
    }
  }
  //中序遍历 V3
  public travIn_I3(_x: BinNode<T>, VST: VSTFunction<T>) {
    let x: BinNode<T> | null = _x;
    let backtrack = false;
    while (true) {
      if (!backtrack && HasLChild(x)) {
        x = x.lChild!;
      } else {
        VST(x);
        if (HasRChild(x)) {
          x = x.rChild!;
          backtrack = false;
        } else {
          if (!(x = x.succ(x))) {
            break;
          }
          backtrack = true;
        }
      }
    }
  }

  //在以S栈顶节点为根的子树中，找到最高左侧可见叶节点
  private gotoHLVFL(stack: Array<BinNode<T>>) {
    let x: BinNode<T> | null = null;
    while ((x = stack[stack.length - 1])) {
      if (HasLChild(x)) {
        if (HasRChild(x)) {
          stack.push(x.rChild!);
        }
        stack.push(x.lChild!);
      } else if (x.rChild) {
        stack.push(x.rChild);
      }
    }
    stack.pop();
  }
  //后序遍历
  public travPost(x: BinNode<T>, VST: VSTFunction<T>) {
    const stack: Array<BinNode<T>> = [];
    if (x) {
      stack.push(x);
    }
    while (stack.length) {
      if (stack[stack.length - 1] !== x.parent) {
        this.gotoHLVFL(stack);
      }
      x = stack.pop()!;
      VST(x);
    }
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

  public disposeTree() {
    this.travLevel((node) => {
      node.dispose();
    });
  }
}
