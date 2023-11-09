import Queue from "../queue/Queue";
import BinNode, {
  HasLChild,
  HasRChild,
  IsLChild,
  IsRChild,
  stature,
} from "./BinNode";

type VSTFunction<T> = (node: BinNode<T>) => void;
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

  //层次遍历整个树
  public travLevel(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this.travLevelFormRoot(visit, this._root);
    }
  }
  //先序遍历整个树
  public travPre(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this.travPreFromRoot(this._root, visit);
    }
  }
  //中序遍历整个树
  public travIn(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this.travIn_I3(this._root, visit);
    }
  }
  //后序遍历整个树
  public travPost(visit: (node: BinNode<T>) => void) {
    if (this._root) {
      this.travPostFromRoot(this._root, visit);
    }
  }

  //层次遍历
  public travLevelFormRoot(VST: VSTFunction<T>, root: BinNode<T>) {
    //队列
    const queue: Queue<BinNode<T>> = new Queue<BinNode<T>>();
    queue.enqueue(root);
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
  public travPreFromRoot(x: BinNode<T>, VST: VSTFunction<T>) {
    const stack: Array<BinNode<T>> = [];
    while (x) {
      this.visitAlongLeftBranch(x, VST, stack);
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
          if (!(x = this.succ(x))) {
            break;
          }
          backtrack = true;
        }
      }
    }
  }

  //在以S栈顶节点为根的子树中，找到最高左侧可见叶节点
  private gotoHLVFL(stack: Array<BinNode<T> | null>) {
    let x: BinNode<T> | null = null;
    while ((x = stack[stack.length - 1])) {
      if (HasLChild(x)) {
        if (HasRChild(x)) {
          stack.push(x.rChild!);
        }
        stack.push(x.lChild!);
      } else {
        stack.push(x.rChild);
      }
    }
    stack.pop();
  }
  //后序遍历
  public travPostFromRoot(x: BinNode<T>, VST: VSTFunction<T>) {
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

  public dispose() {
    this._size = 0;
    if (this._root) {
      this.travLevel((node) => {
        node.dispose();
      });
    }
    this._root = null;
  }
}
