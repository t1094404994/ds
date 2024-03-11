//叶节点
interface LeafNode {
  data: Array<number>;
}
//创建叶节点
function CreatLeaefNode(data: Array<number>): LeafNode {
  return { data };
}

//一般节点
interface Node {
  //左孩子
  lc: Node | LeafNode;
  //右孩子
  rc: Node | LeafNode;
  //划分维度
  splitN: number;
  //划分值
  splitLine: number;
}

//kd树节点
type KdNode = Node | LeafNode;

/**
 * 使用哪个维度进行划分
 * @param n 一共有多少个维度
 * @param d 当前深度
 * @returns
 */
function Even(n: number, d: number): number {
  return d % n;
}

/**
 * 寻找中位数
 */
function FindMedian(p: Array<Array<number>>, n: number): number {
  //TODO use quick select
  return p[Math.floor(p.length / 2)][n];
}

/**
 * 分割点集
 */
function Divide(p: Array<Array<number>>, splitN: number, splitLine: number) {
  const P1: Array<Array<number>> = [];
  const P2: Array<Array<number>> = [];
  for (let i = 0; i < p.length; i++) {
    if (p[i][splitN] < splitLine) {
      P1.push(p[i]);
    } else {
      P2.push(p[i]);
    }
  }
  return { P1, P2 };
}
/**
 * 构建kd树 返回根节点
 * @param p 当前点集
 * @param d 当前深度
 */
export function buildKdTree(
  p: Array<Array<number>>,
  n: number,
  d: number = 0
): KdNode {
  if (p.length === 0) {
    throw new Error("点集不能为空");
  } else if (p.length === 1) return CreatLeaefNode(p[0]);
  const splitN = Even(n, d);
  const splitLine = FindMedian(p, splitN);
  const { P1, P2 } = Divide(p, splitN, splitLine);
  const lc = buildKdTree(P1, n, d + 1);
  const rc = buildKdTree(P2, n, d + 1);
  return { lc, rc, splitN, splitLine };
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

//叶节点和区间的关系
function LeafIsContainedR(v: LeafNode, R: Array<[number, number]>): Relation {
  const data = v.data;
  for (let i = 0; i < data.length; i++) {
    if (data[i] < R[i][0] || data[i] > R[i][1]) {
      return Relation.DISJOINT;
    }
  }
  return Relation.CONTAINED;
}

//节点的左右孩子和区间的关系
function IsContainedR(
  v: Node,
  R: Array<[number, number]>
): [Relation, Relation] {
  const splitN = v.splitN;
  const splitLine = v.splitLine;
  const [a, b] = R[splitN];
  let leftRelation = Relation.DISJOINT;
  if (splitLine >= a) {
    leftRelation = Relation.INTERSECTS;
  }
  let rightRelation = Relation.DISJOINT;
  if (splitLine < b) {
    rightRelation = Relation.INTERSECTS;
  }
  return [leftRelation, rightRelation];
}

//test
function report(v: KdNode) {
  console.log(v);
}
/**
 * 搜索kd树
 */
export function kdSearch(v: KdNode, R: Array<[number, number]>) {
  if ("data" in v) {
    if (LeafIsContainedR(v, R) === Relation.CONTAINED) {
      report(v);
    }
    return;
  }
  const [leftRelation, rightRelation] = IsContainedR(v, R);
  if (leftRelation === Relation.CONTAINED) {
    report(v.lc);
  } else if (leftRelation === Relation.INTERSECTS) {
    kdSearch(v.lc, R);
  }
  if (rightRelation === Relation.CONTAINED) {
    report(v.rc);
  } else if (rightRelation === Relation.INTERSECTS) {
    kdSearch(v.rc, R);
  }
}
