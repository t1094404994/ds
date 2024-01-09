/**
 * 红黑树
 * 1.树根始终为黑色
 * 2.外部节点均为黑色
 * 3.红节点的孩子必为黑
 * 4.任一节点到跟节点的沿途,黑节点的数目相同
 */
import BinNode, {
  HasLChild,
  HasRChild,
  IsLChild,
  IsRoot,
  RBColor,
  stature,
  uncle,
} from "./BinNode";
import BinSearchTree from "./BinSearchTree";
import Entry, { K } from "../entry/Entry";

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
  return (
    stature(x.lChild) == stature(x.rChild) &&
    x.height == (IsRed(x) ? stature(x.lChild) : stature(x.lChild) + 1)
  );
}

export default class BlackRedTree<T> extends BinSearchTree<T> {
  //双红修正
  private solveDoubleRed(x: BinNode<Entry<T>>): BinNode<Entry<T>> | null {
    if (IsRoot(x)) {
      x.color = RBColor.RB_BLACK;
      x.height++;
      return null;
    }
    const p = x.parent!;
    if (IsBlack(p)) return null;
    const g = p.parent!;
    const u = uncle(x)!;
    if (IsBlack(u)) {
      //BB-1 叔叔节点为黑色 ,根据x,p,g的中序遍历顺序,调整中间节点为黑色,两边节点为红色
      if (IsLChild(x) === IsLChild(p)) {
        p.color = RBColor.RB_BLACK;
      } else {
        x.color = RBColor.RB_BLACK;
      }
      g.color = RBColor.RB_RED;
      this.rotateAt(x);
      return null;
    } else {
      //BB-2 叔叔节点为红色,将叔叔节点和父节点染黑,祖父节点染红
      p.color = RBColor.RB_BLACK;
      p.height++;
      u.color = RBColor.RB_BLACK;
      u.height++;
      if (!IsRoot(g)) {
        g.color = RBColor.RB_RED;
      }
      return g;
    }
  }
  //双黑修正
  private solveDoubleBlack(r: BinNode<Entry<T>> | null): void {
    const p = r ? r.parent : this._hot;
    if (!p) return;
    const s = IsLChild(r!) ? p.rChild! : p.lChild!;
    if (IsBlack(s)) {
      let t: BinNode<Entry<T>> | null = null;
      if (HasLChild(s) && IsRed(s.lChild)) {
        t = s.lChild;
      } else if (HasRChild(s) && IsRed(s.rChild)) {
        t = s.rChild;
      }
      //BB-1
      if (t) {
        const oldColor = p.color;
        const b = this.rotateAt(t);
        this.replaceParent(b, p);
        if (HasLChild(b)) {
          b.lChild!.color = RBColor.RB_BLACK;
          this.updateHeight(b.lChild!);
        }
        if (HasRChild(b)) {
          b.rChild!.color = RBColor.RB_BLACK;
          this.updateHeight(b.rChild!);
        }
        b.color = oldColor;
        this.updateHeight(b);
      } else {
        s.color = RBColor.RB_RED;
        s.height--;
        //BB-2R
        if (IsRed(p)) {
          p.color = RBColor.RB_BLACK;
        }
        //BB-2B
        else {
          p.height--;
          this.solveDoubleBlack(p);
        }
      }
    } else {
      //BB-3
      s.color = RBColor.RB_BLACK;
      const t = IsLChild(s) ? s.lChild : s.rChild;
      this.rotateAt(t!);
      // this.replaceParent(b, p);
      this._hot = p;
      this.solveDoubleBlack(r);
    }
  }

  //更新高度
  public updateHeight(x: BinNode<Entry<T>>): number {
    x.height = Math.max(stature(x.lChild), stature(x.rChild));
    return IsBlack(x) ? x.height++ : x.height;
  }

  //插入(重写)
  public insert(e: Entry<T>): BinNode<Entry<T>> {
    this.search(e.key, false);
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
      //双红修正
      let g = this.solveDoubleRed(x);
      //持续调整
      while (g && g.parent && !IsBlack(g.parent)) {
        g = this.solveDoubleRed(g);
      }
      return x;
    }
  }

  //删除(重写)
  public remove(e: K): boolean {
    const x = this.search(e);
    if (!x) return false;
    const r = this.removeAt(x, this._hot)!;
    this._size--;
    if (this.size === 0) {
      return true;
    }
    if (!this._hot) {
      this._root!.color = RBColor.RB_BLACK;
      this.updateHeight(this._root!);
      return true;
    }
    if (BlackUpdateHeight(this._hot)) {
      return true;
    }
    if (IsRed(r)) {
      r.color = RBColor.RB_BLACK;
      r.height++;
      return true;
    }
    this.solveDoubleBlack(r);
    return true;
  }
}
