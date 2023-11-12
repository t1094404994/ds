/**边 */

//边的状态 / 树边 跨边(非祖先后代关系) 前向边(祖先指向后代) 回边(后代指向祖先)
export enum EStatus{UNDETERMINED, TREE, CROSS, FORWARD, BACKWARD}
export default class Edge<T> {
  //数据
  data:T
  //权重
  weight:number
  //类型
  status:EStatus
  constructor(data:T, w:number) {
    this.data = data
    this.weight = w
    this.status = EStatus.UNDETERMINED
  }

  public reset(w:number) {
    this.weight = w
    this.status = EStatus.UNDETERMINED
  }
}