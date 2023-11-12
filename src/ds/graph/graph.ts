import Edge, {EStatus} from './edge'
import Vertex, {VStatus} from './vertex'

export interface EdgeIJ{
  i:number
  j:number
}
export default class Graph<Tv, Te> {
  //顶点集
  protected V:Array<Vertex<Tv>>
  //边集(邻接矩阵)
  protected E:Array<Array<Edge<Te>|null>>
  //边的数量
  protected e:number
  protected n:number
  constructor() {
    this.V = []
    this.E = []
    this.e = 0
    this.n = 0
  }

  public dispose() {
    this.V = []
    this.E = []
    this.e = 0
    this.n = 0
  }

  public reset() {
    for (let i = 0; i < this.n; i++) {
      this.V[i].reset()
      for (let j = 0; j < this.n; j++) {
        const edge = this.E[i][j]
        if (!edge) continue
        edge.reset(0)
      }
    }
  }

  //边是否存在
  public exists(i:number, j:number) {
    if (!this.E[i]) return false
    const edge = this.E[i][j]
    return edge ? edge : false
  }

  //顶点i的下一个邻居
  protected nextNbr(i:number, j:number) {
    while (j > -1 && !this.exists(i, --j)) {
      //
    }
    return j
  }

  //首个邻居
  protected firstNbr(i:number) {
    return this.nextNbr(i, this.n)
  }

  //插入边
  public insertEdge(data:Te, w:number, i:number, j:number) {
    if (this.exists(i, j)) return false
    this.E[i][j] = new Edge<Te>(data, w)
    //更新边数
    this.e++
    //更新关联顶点的出入度
    this.V[i].outDegree++
    this.V[j].inDegree++
    return true
  }

  //移除边
  public removeEdge(i:number, j:number) {
    const eBak = this.E[i][j]
    this.E[i][j] = null
    delete this.E[i][j]
    this.e--
    this.V[i].outDegree--
    this.V[j].inDegree--
    return eBak
  }

  //引入顶点
  public insertVertex(data:Tv) {
    //原来的每行增加空内容
    for (let j = 0; j < this.n; j++) {
      this.E[j].push(null)
    }
    this.n++
    //增加新的一行
    const eArr:Array<Edge<Te>|null> = []
    for (let j = 0; j < this.n; j++) {
      eArr.push(null)
    }
    this.E.push(eArr)
    //新的顶点
    const vertex = new Vertex(data)
    this.V.push(vertex)
    return vertex
  }

  //移除顶及其关联边
  public removeVertex(i:number) {
    for (let j = 0; j < this.n; j++) {
      if (this.exists(i, j)) {
        //删除所有出边
        delete this.E[i][j]
        //更新关联顶点的入度
        this.V[j].inDegree--
      }
    }
    //删除第i行
    this.E.splice(i, 1)
    this.n--
    for (let j = 0; j < this.n; j++) {
      if (this.exists(j, i)) {
        //删除所有入边
        this.E[j].splice(i, 1)
        //更新关联顶点的出度
        this.V[j].outDegree--
      }
    }
    this.V.splice(i, 1)
  }

  //广度优先搜索 v为起点的连通域
  public BFS(v:number, clock:number) {
    //初始化
    const quque:Array<number> = [v]
    this.V[v].status = VStatus.DISCOVERED
    while (quque.length) {
      const v = quque.unshift()
      this.V[v].dTime = ++clock
      //访问v的每个邻居
      for (let u = this.firstNbr(v); -1 < u; u = this.nextNbr(v, u)) {
        const edge = this.E[v][u]
        if (!edge) continue
        if (this.V[u].status === VStatus.UNDISCOVERED) {
          this.V[u].status = VStatus.DISCOVERED
          quque.push(u)
          //引入树边
          edge.status = EStatus.TREE
          //设置父节点 意味着执行广度优先搜索后,沿着任意顶点的父节点出发，如果到达起点，即为到达起点的最短路径(无权图)
          this.V[u].parent = v
        } else {
          //跨边
          edge.status = EStatus.CROSS
        }
      }
      //该顶点访问完毕
      this.V[v].status = VStatus.VISITED
    }
    return clock
  }

  //广度优先搜索 访问所有连通域
  public bfs(s:number) {
    this.reset()
    let clock = 0
    let v = s
    //从s开始遍历一轮顶点 相补为n则一轮完成
    while (s !== (v = (++v % this.n))) {
      if (this.V[v].status === VStatus.UNDISCOVERED) {
        clock = this.BFS(v, clock)
      }
    }
  }

  //深度优先搜索 v为起点的可达域
  public DFS(v:number, clock:number) {
    this.V[v].dTime = ++clock
    this.V[v].status = VStatus.DISCOVERED
    for (let u = this.firstNbr(v); -1 < u; u = this.nextNbr(v, u)) {
      const edge = this.E[v][u]
      if (!edge) continue
      switch (this.V[u].status) {
      //未被发现支撑树可在此拓展
      case VStatus.UNDISCOVERED:
        edge.status = EStatus.TREE
        this.V[u].parent = v
        //递归
        clock = this.DFS(u, clock)
        break
      //已被发现单尚未访问完毕,应属被后代指向的祖先
      case VStatus.DISCOVERED:
        edge.status = EStatus.BACKWARD
        break
      default:
        //u已访问完毕(有向图) 更早被发现则为前向边，否则为跨边
        edge.status = this.V[v].dTime < this.V[u].dTime ? EStatus.FORWARD : EStatus.CROSS
        break
      }
    }
    this.V[v].status = VStatus.VISITED
    this.V[v].fTime = ++clock
    return clock
  }

  //深度优先搜索 访问所有可达域
  public dfs(s:number) {
    this.reset()
    let clock = 0
    let v = s
    while (s !== (v = (++v % this.n))) {
      if (this.V[v].status === VStatus.UNDISCOVERED) {
        clock = this.DFS(v, clock)
      }
    }
  }

  protected hasPath(sV:Vertex<Tv>, eV:Vertex<Tv>) {
    return eV.dTime > sV.dTime && eV.fTime < sV.fTime
  }

  //搜索后，获取通路
  public getPath(startV:number, endV:number):Array<number>|false {
    const sV = this.V[startV]
    const eV = this.V[endV]
    if (!sV || !eV) return false
    if (!this.hasPath(sV, eV)) return false
    let v = eV
    const path:Array<number> = [endV]
    while (v.parent !== startV) {
      path.push(v.parent)
      v = this.V[v.parent]
    }
    path.push(startV)
    return path.reverse()
  }

  //获取顶点关联的边
  public getEdgeList(i:number) {
    const edges:Array<EdgeIJ> = []
    this.E[i].forEach((e, j) => {
      if (e) {
        edges.push({i, j})
      }
    })
    this.E.forEach((line, ii) => {
      line.forEach((e, j) => {
        if (e && j === i) {
          edges.push({i:ii, j})
        }
      })
    })
    return edges
  }
}