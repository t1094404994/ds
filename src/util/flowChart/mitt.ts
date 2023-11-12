import { EdgeIJ } from '@/ds/graph/graph'
import mitt, {Emitter} from 'mitt'
import {LayerType, Pt} from './canvas'
import { VertexType } from './graph'

export interface InsertVertex{
  pt:Pt
  vertexType:VertexType
}

export interface OperEventData{
  vertex:number
  layer:LayerType
}

export interface EdgeEventData{
  edge:EdgeIJ
  layer:LayerType
}
export type DrapEventData=OperEventData&Pt

type Events={
  //插入移除顶点 i
  insertVertex:{pt:Pt, vertexType:VertexType}
  removeVertex:number
  //插入移除边 i,j
  insertEdge:[number, number]
  removeEdge:[number, number]
  /**操作事件 顶点i*/
  statusChanged:OperEventData
  //操作事件
  //顶点点击事件
  vertextClick:OperEventData
  //边的点击事件
  edgeClick:EdgeEventData
  //拖动顶点事件
  dragVertexStart:DrapEventData
  dragVertexMove:DrapEventData
  dragVertexEnd:Pt
  //拖动边事件
  dragEdgeStart:DrapEventData
  dragEdgeMove:DrapEventData
  dragEdgeEnd:Pt
  //更新操作模式
  updateInOpertion:boolean
  //移除当前顶点
  removeCurrentVertext:undefined
  //移除当前边
  removeCurrentEdge:undefined
  //设置当前选中节点/边的信息
  //更新当前选中节点/边的信息
}

const emitter:Emitter<Events> = mitt<Events>()
export default emitter