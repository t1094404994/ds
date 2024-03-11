import BinNode from "./BinNode";
import Entry from "../entry/Entry";

type Node = BinNode<Entry<Array<number>>>;
//Kd树节点
interface KDNode {
  //当前节点包含的点
  nodes: Array<Node>;
  //左孩子
  lc: KDNode | null;
  //右孩子
  rc: KDNode | null;
  //划分维度
  splitN?: number;
  //划分值
  splitLine?: number;
}

/**
 * 使用哪个维度进行划分
 * @param n 一共有多少个维度
 * @param d 当前深度
 * @returns
 */
function Even(n: number, d: number): number {
  return n % d;
}

/**
 * 创建kd树节点
 */
function CreateKdNode(
  nodes: Array<Node>,
  splitN?: number,
  splitLine?: number
): KDNode {
  return {
    nodes,
    splitN,
    splitLine,
    lc: null,
    rc: null,
  };
}

/**
 * 是否是叶子节点
 * @param node 节点
 * @returns
 */
function IsLeaf(node: KDNode): boolean {
  return node.lc === null && node.rc === null;
}

/**
 * 寻找中位数
 */
function FindMedian(p: Array<Node>, n: number): number {
  return 0;
}

/**
 * 分割点集
 */
function Divide(p: Array<Node>, splitN: number, splitLine: number) {
  const P1: Array<Node> = [];
  const P2: Array<Node> = [];
  return { P1, P2 };
}
/**
 * 构建kd树 返回根节点
 * @param p 当前点集
 * @param d 当前深度
 */
export function buildKdTree(p: Array<Node>, n: number, d: number = 0): KDNode {
  if (p.length === 0) throw new Error("点集不能为空");
  else if (p.length === 1) return CreateKdNode(p);
  const root = CreateKdNode(p, Even(n, d));
  root.splitLine = FindMedian(p, root.splitN!);
  const { P1, P2 } = Divide(p, root.splitN!, root.splitLine!);
  root.lc = buildKdTree(P1, n, d + 1);
  root.rc = buildKdTree(P2, n, d + 1);
  return root;
}

//节点和区间的关系
enum Relation {
  //包含于
  CONTAINED,
  //相交
  INTERSECTS,
  //不相交
  DISJOINT,
}
//节点的左右孩子和区间的关系
function IsContainedR(v: KDNode | null, R: Array<[number, number]>): Relation {
  return Relation.CONTAINED;
}

//test
function report(v: KDNode) {
  //
}
//节点是否和区间相交
/**
 * 搜索kd树
 */
export function kdSearch(v: KDNode, R: Array<[number, number]>) {
  if (IsLeaf(v)) {
    if (IsContainedR(v, R) === Relation.CONTAINED) {
      report(v);
    }
    return;
  }
  if (IsContainedR(v.lc, R) === Relation.CONTAINED) {
    report(v.lc!);
  } else if (IsContainedR(v.lc, R) === Relation.INTERSECTS) {
    kdSearch(v.lc!, R);
  }
  if (IsContainedR(v.rc, R) === Relation.CONTAINED) {
    report(v.rc!);
  } else if (IsContainedR(v.rc, R) === Relation.INTERSECTS) {
    kdSearch(v.rc!, R);
  }
}
