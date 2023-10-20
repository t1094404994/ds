import List from "../list/List";

/**
 * 基于列表(链表)的队列结构
 */
export default class Queue<T> {
  private data: List<T> = new List<T>();
  constructor() {
    //
  }

  //是否为空
  public empty(): boolean {
    return this.data.empty();
  }
  //入队
  public enqueue(e: T) {
    this.data.insertAsLast(e);
  }

  //出队
  public dequeue(): T | null {
    if (this.data.empty()) {
      return null;
    }
    return this.data.remove(this.data.first!);
  }

  public dispose() {
    this.data.dispose();
  }
}
