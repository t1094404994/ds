/**
 * 列表(链表)节点
 */
export default class ListNode<T> {
  //数据
  private data: T | null;
  //前驱
  public pred: ListNode<T> | null;
  //后继
  public succ: ListNode<T> | null;
  constructor(
    data: T | null = null,
    pred: ListNode<T> | null = null,
    succ: ListNode<T> | null = null
  ) {
    this.data = data;
    this.pred = pred;
    this.succ = succ;
  }

  //作为当前节点前驱的插入
  public insertAsPred(e: T) {
    //创建新节点
    const node = new ListNode(e, this.pred, this);
    //变更引用关系
    this.pred && this.pred.setSuccNode(node);
    this.setPredNode(node);
  }
  //作为当前节点后继插入
  public insertAsSucc(e: T) {
    //创建新节点
    const node = new ListNode(e, this, this.succ);
    //变更引用关系
    this.succ && this.succ.setPredNode(node);
    this.setSuccNode(node);
  }

  //设置当前节点的前驱
  public setPredNode(node: ListNode<T> | null) {
    if (this.pred) {
      this.pred.succ = null;
    }
    this.pred = node;
  }

  //设置当前节点的后继
  public setSuccNode(node: ListNode<T> | null) {
    if (this.succ) {
      this.succ.pred = null;
    }
    this.succ = node;
  }

  //清除当前节点
  public clear() {
    const data = this.data;
    this.data = null;
    const pred = this.pred;
    this.pred?.setSuccNode(this.succ);
    this.succ?.setPredNode(pred);
    return data;
  }
}
