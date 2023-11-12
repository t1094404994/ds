/**顶点 */
//顶点状态 未被发现 已经发现 已经被访问
export enum VStatus{UNDISCOVERED, DISCOVERED, VISITED}
export default class Vertex<T> {
  //数据
  public data:T
  //入出度 (跟多少个节点关联) 无向图则出入度一致
  public inDegree:number
  public outDegree:number
  //状态
  public status:VStatus
  //时间标签 活跃期active=[d,f] u是v的后代 则 active(u)为active(v)的非空真子集 交集为空则v，u无关，没有通路
  public dTime:number
  public fTime:number
  //在遍历树中的父节点
  public parent:number
  //在遍历树中的优先级
  public priority:number
  constructor(d:T) {
    this.data = d
    this.inDegree = 0
    this.outDegree = 0
    this.status = VStatus.UNDISCOVERED
    this.dTime = -1
    this.fTime = -1
    this.parent = -1
    this.priority = 99999
  }

  //重置信息
  public reset() {
    this.status = VStatus.UNDISCOVERED
    this.dTime = -1
    this.fTime = -1
    this.parent = -1
    this.priority = 99999
  }
}