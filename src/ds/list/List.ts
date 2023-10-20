import ListNode from "./ListNode";
/**
 * 列表(链表)结构
 */
export default class List<T> {
  //规模
  private _size: number = 0;
  //头哨兵
  private header: ListNode<T> = new ListNode<T>(null, null, null);
  //尾哨兵
  private trailer: ListNode<T> = new ListNode<T>(null, null, null);
  constructor() {
    this.header.setSuccNode(this.trailer);
    this.trailer.setPredNode(this.header);
  }

  /** protected */
  //清除节点
  protected clear() {
    let p = this.header.succ;
    //清除全部节点的引用关系
    while (p && p !== this.trailer) {
      const q = p;
      p = p.succ;
      q.clear();
    }
    this.header.setSuccNode(this.trailer);
    this.trailer.setPredNode(this.header);
    this._size = 0;
  }

  /** public */
  //初始化
  public init() {
    this._size = 0;
    this.header = new ListNode<T>(null, null, null);
    this.trailer = new ListNode<T>(null, null, null);
    this.header.setSuccNode(this.trailer);
    this.trailer.setPredNode(this.header);
  }
  //判断列表是否为空
  public empty(): boolean {
    return this._size === 0;
  }

  //将e作为首节点插入
  public insertAsFirst(e: T) {
    this.header.insertAsSucc(e);
    this._size++;
  }

  //将e作为末节点插入
  public insertAsLast(e: T) {
    this.trailer.insertAsPred(e);
    this._size++;
  }

  //将e作为p的前驱插入
  public insertBefore(p: ListNode<T>, e: T) {
    p.insertAsPred(e);
    this._size++;
  }

  //将e作为p的后继插入
  public insertAfter(p: ListNode<T>, e: T) {
    p.insertAsSucc(e);
    this._size++;
  }

  //删除合法位置p处的节点,返回被删除节点
  public remove(p: ListNode<T>): T | null {
    const data = p.clear();
    this._size--;
    return data;
  }

  //逆序
  public reverse() {
    const p = this.header;
    this.trailer = this.header;
    this.header = p;
  }

  //按下标访问
  public getNodeByRank(rank: number): ListNode<T> | null {
    if (rank < 0 || rank >= this._size) {
      return null;
    }
    let p = this.header.succ;
    while (rank-- && p) {
      p = p.succ;
    }
    return p;
  }

  //获取规模
  get size(): number {
    return this._size;
  }

  //获取首节点
  get first(): ListNode<T> | null {
    return this.header.succ;
  }

  public dispose() {
    this.clear();
    this.header.clear();
    this.trailer.clear();
  }
}
