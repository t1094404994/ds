/**流程图数据结构*/
import Graph from '@/ds/graph/graph'
import {VStatus} from '@/ds/graph/vertex'
import Edge, {EStatus} from '@/ds/graph/edge'
import {GraphType, Pt, DrawConfig, TextConfig, EdgeConfig, createTextConfig, createDrawConfig, createEdgeConfig} from './canvas'
import {defaultRGB, getEdgeArrowRadian, BaseStyle, defaultArrowW} from './canvas'
import { FromVertexBPMNData, FromEdgeBPMNData, VertexBPMNData, EdgeBPMNData, createVertexBPMNData, createEdgeBPMNData, createBPNMId} from './bpmn'


//顶点类型 开始,结束,节点,分支
export enum VertexType{START, END, NODE, BRANCH}
//顶点数据
export interface VertexData{
  //id
  vId:string
  //网格位置中的下标
  gridIndex:number
  //顶点类型
  type:VertexType
  //图形配置
  drawConfig:DrawConfig
  //文字
  text:string
  //文字配置
  textConfig:TextConfig
  //节点的审批流数据
  data:FromVertexBPMNData
}

//边数据
export interface EdgeData{
  //文字
  text:string
  textConfig?:TextConfig
  //边的网格路径 网格下标
  gridPath:Array<number>
  edgeConfig:EdgeConfig
  //边审批流数据
  data?:FromEdgeBPMNData
}

//获取顶点类型对应的图形类型
export const getGraphType = (vertexType:VertexType):GraphType => {
  switch (vertexType) {
  case VertexType.START:
    return GraphType.ARC
  case VertexType.END:
  case VertexType.NODE:
    return GraphType.RECT
  case VertexType.BRANCH:
    return GraphType.POLYGON
  }
}

//获取顶点默认文字
const getVertexText = (vertexType:VertexType):string => {
  switch (vertexType) {
  case VertexType.START:
    return '开始'
  case VertexType.END:
    return '结束'
  case VertexType.BRANCH:
    return '分支条件'
  case VertexType.NODE:
    return '节点'
  }
}

//获取边的默认文字
const getEdgeText = (disable?:boolean):string => {
  return '设置条件'
}

type Grid=[number, number]
//网格配置
export interface GridConfig{
  //网格 行,列数
  grid:Grid
  //行高
  rowHeight:number
  //行间距
  rowGap:number
  //列宽
  colWidth:number
  //列间距
  colGap:number
}

//根据网格顶点下标获取网格坐标
export const getGridPt = (gridIndex:number, gridConfig:GridConfig):Pt => {
  const colNum = gridConfig.grid[1]
  const x = gridIndex % colNum
  const y = Math.floor(gridIndex / colNum)
  return {x, y}
}

//根据网格坐标获取网格顶点下标
export const getGridIndexByGridPt = (pt:Pt, gridConfig:GridConfig):number => {
  return pt.x + pt.y * gridConfig.grid[1]
}

//根据网格下标获取实际坐标
export const getPT = (gridIndex:number, gridConfig:GridConfig):Pt => {
  const rowNum = gridConfig.grid[0]
  const colNum = gridConfig.grid[1]
  let x = gridIndex % colNum
  let y = Math.floor(gridIndex / colNum)
  if (x > rowNum - 1) x = rowNum - 1
  x = Math.floor(x * (gridConfig.colWidth + gridConfig.colGap) + gridConfig.colWidth / 2)
  y = Math.floor(y * (gridConfig.rowHeight + gridConfig.rowGap) + gridConfig.rowHeight / 2)
  return {x, y}
}


//根据网格路径获取实际路径
export const getPath = (gridPath:Array<number>, gridConfig:GridConfig):Array<Pt> => {
  const arr:Array<Pt> = []
  gridPath.forEach((gridIndex) => {
    arr.push(getPT(gridIndex, gridConfig))
  })
  return arr
}


//根据坐标计算网格下标
export const getGridIndex = (pt:Pt, gridConfig:GridConfig):number => {
  let rowIndex = Math.floor((pt.x) / (gridConfig.colWidth + gridConfig.colGap))
  let colIndex = Math.floor((pt.y) / (gridConfig.rowHeight + gridConfig.rowGap))
  rowIndex = rowIndex >= 0 ? rowIndex : 0
  colIndex = colIndex >= 0 ? colIndex : 0
  return colIndex * gridConfig.grid[1] + rowIndex
}

//获取顶点图形背景色和描边
export const getVertexFill = (type:VertexType):BaseStyle => {
  if (type === VertexType.START) {
    //137B80 1A7B80
    return {fillStyle:defaultRGB, strokeStyle:'#137B80'}
  }
  else if (type === VertexType.NODE) {
    return {fillStyle:defaultRGB, strokeStyle:'#1A7B80'}
  }
  else if (type === VertexType.BRANCH) {
    return {fillStyle:[0xfd, 0xa9, 0x8d], strokeStyle:'#BA7E6A'}
  }
  else {
    return {fillStyle:[0x65, 0x6f, 0x79], strokeStyle:'#51585E'}
  }
}


const getRWH = (type:VertexType) => {
  if (type === VertexType.BRANCH) {
    const branchW = 128
    const branchH = 64
    return {r:undefined, w:branchW, h:branchH}
  }
  else if (type === VertexType.END) {
    const endW = 94
    const endH = 46
    return {r:undefined, w:endW, h:endH, radius:23}
  }
  else {
    return {r:undefined, w:undefined, h:undefined}
  }
}
//创建顶点数据
export const createVertextData = (type:VertexType, gridIndex:number, gridConfig:GridConfig, _data?:VertexBPMNData):VertexData => {
  const vId = _data ? _data.id : createBPNMId('-V')
  const pt = getPT(gridIndex, gridConfig)
  const {r, w, h, radius} = getRWH(type)
  const drawConfig = createDrawConfig(getGraphType(type), pt, r, w, h, radius)
  const baseStyle = getVertexFill(type)
  if (baseStyle.fillStyle) drawConfig.fillStyle = baseStyle.fillStyle
  if (baseStyle.strokeStyle) drawConfig.strokeStyle = baseStyle.strokeStyle
  const text = _data ? _data.name : getVertexText(type)
  const textConfig = createTextConfig(pt, text, drawConfig.box[1] - drawConfig.box[0])
  let data = _data
  if (!data) {
    data = createVertexBPMNData(type, vId, text)
  }
  return {vId, type, drawConfig, text, gridIndex, textConfig, data}
}


//边线的偏移
export const getOffset = (config:DrawConfig, fristpt:Pt, secondPt:Pt, contrary?:boolean) => {
  const wHalf = Math.floor((config.box[1] - config.box[0]) / 2)
  const hHalf = Math.floor((config.box[3] - config.box[2]) / 2)
  let offsetX = secondPt.x > fristpt.x ? wHalf : (secondPt.x < fristpt.x) ? -wHalf : 0
  let offsetY = secondPt.y > fristpt.y ? hHalf : (secondPt.y < fristpt.y) ? -hHalf : 0
  if (contrary) {
    const delta = defaultArrowW * 2
    if (offsetX > 0) offsetX += delta
    else if (offsetX < 0) offsetX -= delta
    if (offsetY > 0) offsetY += delta
    else if (offsetY < 0) offsetY -= delta
    offsetX = -offsetX
    offsetY = -offsetY
  }
  return {offsetX, offsetY}
}
const edgeTextW = 150

export const getEdgeTextPt = (linePath:Array<Pt>) => {
  const pt:Pt = {x:-1, y:-1}
  if (linePath.length > 3) {
    const pathPt = linePath[linePath.length - 2]
    pt.x = pathPt.x
    pt.y = pathPt.y
  } else {
    const startPt = linePath[0]
    const endPt = linePath[1]
    pt.x = Math.floor((startPt.x + endPt.x) / 2)
    pt.y = Math.floor((startPt.y + endPt.y) / 2)
  }
  return pt
}

export const updateEdgeLine = (config:EdgeConfig, linePath:Array<Pt>) => {
  config.linePath = linePath
  const arrowRadian = getEdgeArrowRadian(linePath)
  config.arrowRadian = arrowRadian
}

export const updateEdgeLinePath = (data:EdgeData, linePath:Array<Pt>) => {
  if (data.edgeConfig) updateEdgeLine(data.edgeConfig, linePath)
  if (data.textConfig) {
    const pt = getEdgeTextPt(linePath)
    data.textConfig.anchorX = pt.x
    data.textConfig.anchorY = pt.y
  }
}

//创建边数据
export const createEdgeData = (linePath:Array<Pt>, gridPath:Array<number>, i:number, j:number, iId:string, jId:string, disable?:boolean, _data?:EdgeBPMNData):EdgeData|false => {
  const text = _data ? _data.conditionName : getEdgeText()
  const maxWidth = edgeTextW
  const pt = getEdgeTextPt(linePath)
  const edgeConfig = createEdgeConfig(linePath)
  if (!edgeConfig) return false
  let data = _data
  const textConfig = createTextConfig(pt, text, maxWidth, i, j)
  textConfig.fillStyle = '#000000'
  if (!data) {
    data = createEdgeBPMNData(iId, jId, text, disable)
  }
  return {text, textConfig, edgeConfig, gridPath, data}
}

interface WeightList<T>{
  u:number
  e:Edge<T>
}

//网格数据结构 顶点数据标识该顶点是否被占用 边数据标识该边是否被占用
export class GridGraph extends Graph<boolean, boolean> {
  private gridConfig:GridConfig
  constructor(_gridConfig:GridConfig) {
    super()
    this.gridConfig = _gridConfig
    this.initGrid()
  }

  private get grid() {
    return this.gridConfig.grid
  }

  private get rowNum() {
    return this.grid[0]
  }

  private get colNum() {
    return this.grid[1]
  }

  private get vertexNum() {
    return this.grid[0] * this.grid[1]
  }


  //初始化网格点的边
  private initPtEdge = (i:number, j:number) => {
    const vertexIndex = j * this.colNum + i
    if (j > 0) {
      const topVertexIndex = vertexIndex - this.colNum
      this.insertEdge(false, 1, vertexIndex, topVertexIndex)
    }
    if (j + 1 < this.rowNum) {
      const bottomVertexIndex = vertexIndex + this.colNum
      this.insertEdge(false, 1, vertexIndex, bottomVertexIndex)
    }
    if (i > 0) {
      const leftVertextIndex = vertexIndex - 1
      this.insertEdge(false, 1, vertexIndex, leftVertextIndex)
    }
    if (i + 1 < this.colNum) {
      const rightVertexIndex = vertexIndex + 1
      this.insertEdge(false, 1, vertexIndex, rightVertexIndex)
    }
  }

  //初始化网格
  private initGrid() {
    //初始化顶点
    for (let i = 0; i < this.colNum; i++) {
      for (let j = 0; j < this.rowNum; j++) {
        this.insertVertex(false)
      }
    }
    //初始化边
    for (let i = 0; i < this.colNum; i++) {
      for (let j = 0; j < this.rowNum; j++) {
        this.initPtEdge(i, j)
      }
    }
  }

  //设置顶点占用状态
  public setVertexData(i:number, data:boolean) {
    if (i < 0 || i > this.vertexNum) return false
    const vertex = this.V[i]
    vertex.data = data
  }

  //设置边的占用状态
  public setEdgeData(i:number, j:number, data:boolean) {
    if (!this.exists(i, j)) return false
    const edge = this.E[i][j]
    if (!edge) return false
    edge.data = data
  }

  public updateEdgeData(gridPath:Array<number>, bool:boolean) {
    for (let i = 1, l = gridPath.length; i < l; i++) {
      this.setEdgeData(gridPath[i - 1], gridPath[i], bool)
    }
  }

  //根据距离设置权重
  private getWeight(startGridIndex:number, endGridIndex:number) {
    const startPt = getGridPt(startGridIndex, this.gridConfig)
    const endPt = getGridPt(endGridIndex, this.gridConfig)
    //如果边对应的点已经被占用 则距离最大
    const max = Math.pow(this.rowNum * this.colNum, 2)
    if (startGridIndex !== endGridIndex && this.V[startGridIndex].data) return 0
    else return max - Math.floor(Math.pow(endPt.x - startPt.x, 2) + Math.pow(endPt.y - startPt.y, 2))
  }

  //设置权重
  public setWeight(endV:number) {
    this.E.forEach((line) => {
      line.forEach((e, j) => {
        if (e) {
          e.weight = this.getWeight(j, endV)
        }
      })
    })
  }

  //加权查找邻居
  protected nextNbr(i: number, j: number): number {
    let minWeight = 0
    let eIndex = j
    while (j > -1) {
      const edge = this.exists(i, --j)
      if (edge && edge.weight < minWeight) {
        minWeight = edge.weight
        eIndex = j
      }
    }
    return eIndex
  }

  //获取顶点边数组(加权排序)
  private getWeightList(i:number):Array<WeightList<boolean>> {
    const arr:Array<WeightList<boolean>> = []
    this.E[i].forEach((e, u) => {
      if (e) arr.push({e, u})
    })
    arr.sort((a, b) => b.e.weight - a.e.weight)
    return arr
  }

  //深度优先搜索 v为起点的可达域
  public DFS(startV:number, clock:number, endV?:number) {
    this.V[startV].dTime = ++clock
    this.V[startV].status = VStatus.DISCOVERED
    const list = this.getWeightList(startV)
    for (let i = 0, l = list.length; i < l; i++) {
      const {u, e} = list[i]
      const edge = e
      //边被占用则跳过
      if (!edge || edge.data) continue
      switch (this.V[u].status) {
      //未被发现支撑树可在此拓展
      case VStatus.UNDISCOVERED:
        edge.status = EStatus.TREE
        this.V[u].parent = startV
        //递归
        clock = this.DFS(u, clock, endV)
        break
      //已被发现单尚未访问完毕,应属被后代指向的祖先
      case VStatus.DISCOVERED:
        edge.status = EStatus.BACKWARD
        break
      default:
        //u已访问完毕(有向图) 更早被发现则为前向边，否则为跨边
        edge.status = this.V[startV].dTime < this.V[u].dTime ? EStatus.FORWARD : EStatus.CROSS
        break
      }
    }
    this.V[startV].status = VStatus.VISITED
    this.V[startV].fTime = ++clock
    return clock
  }

  //寻路 深度优先 加权
  public findPath(startV:number, endV:number):Array<number>|false {
    this.reset()
    this.setWeight(endV)
    this.DFS(startV, 0, endV)
    return this.getPath(startV, endV)
  }

  public dispose() {
    super.dispose()
  }
}
//流程图数据结构
export default class FlowChart extends Graph<VertexData, EdgeData> {
  constructor() {
    super()
  }

  //检查网格下标是否存在
  public gridExists(gridIndex:number) {
    for (let i = 0; i < this.n; i++) {
      if (this.V[i].data.gridIndex === gridIndex) {
        return true
      }
    }
    return false
  }

  //获取顶点数据
  public getVertexNum() {
    return this.n
  }

  //获取顶点数据
  public getVertexData(i:number) {
    return this.V[i] ? this.V[i].data : null
  }

  //获取边的数据
  public getEdgeData(i:number, j:number) {
    const edge = this.exists(i, j)
    if (edge) return edge.data
    else return false
  }

  //获取顶点图形配置 只有初始化和新增删除顶点需要
  public getVertextDrawConfigs():Array<DrawConfig> {
    const arr:Array<DrawConfig> = []
    this.V.forEach((v) => {
      arr.push(v.data.drawConfig)
    })
    return arr
  }
  //获取顶点文字配置 只有初始化和新增删除顶点需要
  public getVertextTextConfigs():Array<TextConfig> {
    const arr:Array<TextConfig> = []
    this.V.forEach((v) => {
      arr.push(v.data.textConfig)
    })
    return arr
  }
  //获取边的配置
  public getEdgeConfigs():Array<EdgeConfig> {
    const arr:Array<EdgeConfig> = []
    this.E.forEach((line) => {
      line.forEach((e) => {
        if (e) arr.push(e.data.edgeConfig)
      })
    })
    return arr
  }
  //获取边的文字
  public getEdgeTextConfigs():Array<TextConfig> {
    const arr:Array<TextConfig> = []
    this.E.forEach((line) => {
      line.forEach((e) => {
        if (e && e.data.textConfig) arr.push(e.data.textConfig)
      })
    })
    return arr
  }

  //检查流程图通路
  public checkPath = (start:number, end:number) => {
    this.reset()
    this.DFS(start, 0)
    const startData = this.V[start]
    for (let i = 0, l = this.V.length; i < l; i++) {
      if (i === start || i === end) continue
      const node = this.V[i]
      const isIn = node.dTime > startData.dTime && node.fTime < startData.fTime
      if (!isIn) return false
    }
    //逆转边
    const eArr:Array<{i:number, j:number, edgeData:Edge<EdgeData>}> = []
    this.E.forEach((line, i) => {
      line.forEach((e, j) => {
        const edgeData = this.exists(i, j)
        if (edgeData) {
          eArr.push({i, j, edgeData})
          this.removeEdge(i, j)
        }
      })
    })
    eArr.forEach((e) => {
      this.insertEdge(e.edgeData.data, 1, e.j, e.i)
    })
    this.reset()
    this.DFS(end, 0)
    const endData = this.V[end]
    let flag = true
    for (let i = 0, l = this.V.length; i < l; i++) {
      if (i === start || i === end) continue
      const node = this.V[i]
      const isIn = node.dTime > endData.dTime && node.fTime < endData.fTime
      if (!isIn) {
        flag = false
        break
      }
    }
    //还原边
    eArr.forEach((e) => {
      this.removeEdge(e.j, e.i)
      this.insertEdge(e.edgeData.data, 1, e.i, e.j)
    })
    return flag
  }

  public dispose() {
    super.dispose()
  }
}
