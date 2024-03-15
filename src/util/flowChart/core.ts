/**核心控制类 */
import { setBit, checkBit } from "@/util/math";
import { EdgeIJ } from "@/ds/graph/graph";
import mitt, {
  InsertVertex,
  OperEventData,
  DrapEventData,
  EdgeEventData,
} from "./mitt";
import {
  BgLayer,
  TopLayer,
  OperationStatusBit,
  DrawStatusBit,
  LayerType,
  Pt,
  DrawConfig,
  updateDrawConfig,
} from "./canvas";
import { createDrawClickConfig, createEdgeConfig } from "./canvas";
import FlowChart, {
  GridGraph,
  GridConfig,
  getPT,
  getGridIndex,
  updateEdgeLinePath,
  getGridPt,
  EdgeData,
  VertexType,
} from "./graph";
import { getOffset, createVertextData, createEdgeData } from "./graph";
import { VertexBPMNData, EdgeBPMNData, createXMLData } from "./bpmn";

interface ConsolerData {
  backgroundCtx: CanvasRenderingContext2D;
  backgroundCanvas: HTMLCanvasElement;
  dynamicCtx: CanvasRenderingContext2D;
  dynamicCanvas: HTMLCanvasElement;
}

export default class Controller {
  //背景层
  private backgroundLayer: BgLayer;
  //动态层
  private dynamicLayer: TopLayer;
  private data: ConsolerData;
  //当前选中顶点
  private currentVertex: number;
  //当前选中的边
  private currentEdge: EdgeIJ;
  //是否在操作中
  private _inOperation: boolean;
  //流程图结构
  private flowChart: FlowChart;
  //网格图结构
  private gridGraph: GridGraph;
  private gridConfig: GridConfig;
  //显示错误信息
  public isShowMessage = true;
  constructor(data: ConsolerData, _gridConfig: GridConfig) {
    //绑定回调
    this.initBind();
    this.currentVertex = -1;
    this.currentEdge = { i: -1, j: -1 };
    this.gridConfig = _gridConfig;
    this.data = data;
    this.backgroundLayer = new BgLayer(
      data.backgroundCtx,
      data.backgroundCanvas
    );
    this.dynamicLayer = new TopLayer(data.dynamicCtx, data.dynamicCanvas);
    this.flowChart = new FlowChart();
    this.gridGraph = new GridGraph(this.gridConfig);
    this._inOperation = false;
    console.log("data init", this.data);
  }

  private initBind() {
    const self = this;
    this.onStatus = this.onStatus.bind(self);
    this.insertVecter = this.insertVecter.bind(self);
    this.removeVerter = this.removeVerter.bind(self);
    this.onInsterEdge = this.onInsterEdge.bind(self);
    this.onRemoveEdge = this.onRemoveEdge.bind(self);
    this.onVertextClick = this.onVertextClick.bind(self);
    this.onDragVertexStart = this.onDragVertexStart.bind(self);
    this.onDragVertexEnd = this.onDragVertexEnd.bind(self);
    this.onDragEdgeStart = this.onDragEdgeStart.bind(self);
    this.onDragEdgeEnd = this.onDragEdgeEnd.bind(self);
    this.onEdgeClick = this.onEdgeClick.bind(self);
    this.onRemoveCurrentVertext = this.onRemoveCurrentVertext.bind(self);
    this.onRemoveCurrentEdge = this.onRemoveCurrentEdge.bind(self);
  }

  public get inOperation() {
    return this._inOperation;
  }

  public set inOperation(bool: boolean) {
    if (bool) {
      this.dynamicLayer.frame = 120;
      this.backgroundLayer.removeEvents();
      this.dynamicLayer.addEvents();
    } else {
      this.dynamicLayer.frame = 0;
      this.backgroundLayer.addEvents();
      this.dynamicLayer.removeEvents();
    }
    this._inOperation = bool;
    mitt.emit("updateInOpertion", bool);
  }

  public getGridConfig() {
    return this.gridConfig;
  }

  //更新背景配置 TODO 可优化
  public updateBgConfig() {
    const drawConfigs = this.flowChart.getVertextDrawConfigs();
    const textConfigs = this.flowChart.getVertextTextConfigs();
    const edgeConfigs = this.flowChart.getEdgeConfigs();
    const edgeTextConfigs = this.flowChart.getEdgeTextConfigs();
    this.backgroundLayer.setConfigs(
      drawConfigs,
      textConfigs,
      edgeConfigs,
      edgeTextConfigs
    );
  }

  //重新渲染背景层
  public drawBgCall() {
    this.backgroundLayer.drawCall();
  }

  //是否可设为点击状态
  private checkClick(status: OperationStatusBit, layer: LayerType) {
    if (layer !== LayerType.BG) return false;
    return checkBit(status, OperationStatusBit.DOWN);
  }

  //是否可设为hover状态
  private checkHover(status: OperationStatusBit, layer: LayerType) {
    if (layer !== LayerType.BG) return false;
    return checkBit(status, OperationStatusBit.HOVER);
  }

  private setOperationStataus(config: DrawConfig, layer: LayerType) {
    const { drawStatus } = config;
    //hover
    config.drawStatus = setBit(
      config.drawStatus,
      DrawStatusBit.SHADOW,
      this.checkHover(config.operationStatus, layer)
    );
    //click
    config.drawStatus = setBit(
      config.drawStatus,
      DrawStatusBit.CLICK,
      this.checkClick(config.operationStatus, layer)
    );
    return drawStatus !== config.drawStatus;
  }

  //点击
  private onVertextClick(evt: OperEventData) {
    //边和顶点只能点一个
    this.currentEdge = { i: -1, j: -1 };
    const data = this.flowChart.getVertexData(evt.vertex);
    if (evt.layer === LayerType.BG && data) {
      this.currentVertex = evt.vertex;
      this.backgroundLayer.setClickBox(
        createDrawClickConfig(data.drawConfig.box)
      );
      this.backgroundLayer.drawCall();
    }
  }

  //开始拖动
  private onDragVertexStart(evt: DrapEventData) {
    this.currentVertex = evt.vertex;
    //设置底层透明
    const data = this.flowChart.getVertexData(evt.vertex);
    if (!data) return;
    const { drawStatus } = data.drawConfig;
    data.drawConfig.drawStatus = setBit(
      drawStatus,
      DrawStatusBit.DROPSHADOW,
      true
    );
    if (drawStatus !== data.drawConfig.drawStatus) {
      this.backgroundLayer.drawCall();
    }
    //复制数据到操作层
    const config: DrawConfig = { ...data.drawConfig };
    this.dynamicLayer.setDrawConfig(config);
    this.inOperation = true;
  }

  //设置表格路径占用
  private setEdgesPathUsed = (edges: Array<EdgeIJ>, bool: boolean) => {
    edges.forEach((edge) => {
      const edgeData = this.flowChart.getEdgeData(edge.i, edge.j);
      if (edgeData) {
        this.gridGraph.updateEdgeData(edgeData.gridPath, bool);
      }
    });
  };

  //找到所有新通路
  private findNewPath(
    vertex: number,
    nowGridIndex: number,
    oldGridIndex: number,
    edges: Array<EdgeIJ>
  ) {
    this.setEdgesPathUsed(edges, false);
    this.gridGraph.setVertexData(oldGridIndex, false);
    let flag = true;
    const pathArr: Array<Array<number>> = [];
    const edgeDataArr: Array<EdgeData> = [];
    for (let i = 0, l = edges.length; i < l; i++) {
      const edgeij = edges[i];
      const startData = this.flowChart.getVertexData(edgeij.i);
      const endData = this.flowChart.getVertexData(edgeij.j);
      if (!startData || !endData) {
        flag = false;
        break;
      }
      const startGridIndex =
        edgeij.i === vertex ? nowGridIndex : startData.gridIndex;
      const endGridIndex =
        edgeij.j === vertex ? nowGridIndex : endData.gridIndex;
      const path = this.checkEdgePath(startGridIndex, endGridIndex);
      if (!path || path.length < 2) {
        flag = false;
        break;
      }
      const edgeData = this.flowChart.getEdgeData(edgeij.i, edgeij.j);
      if (!edgeData) {
        flag = false;
        break;
      }
      edgeDataArr.push(edgeData);
      pathArr.push(path);
    }
    if (flag) return { edgeDataArr, pathArr };
    else return false;
  }

  private updateEdgeLine = (
    nowGridIndex: number,
    pathArr: Array<Array<number>>,
    edgeDataArr: Array<EdgeData>,
    edges: Array<EdgeIJ>
  ) => {
    console.log("nowGridIndex", nowGridIndex);
    pathArr.forEach((path, index) => {
      const edgedata = edgeDataArr[index];
      edgedata.gridPath = path;
      const edgeij = edges[index];
      const linePath = this.getLinePath(
        path,
        this.gridConfig,
        edgeij.i,
        edgeij.j
      );
      updateEdgeLinePath(edgedata, linePath);
      this.gridGraph.updateEdgeData(path, true);
    });
  };

  private checkDragVertexPath(vertex: number, pt: Pt) {
    const data = this.flowChart.getVertexData(vertex);
    if (!data) return false;
    const nowGridIndex = getGridIndex(pt, this.gridConfig);
    const oldGridIndex = data.gridIndex;
    //如果有边的关系,需要检查边的关系,重新寻路
    const edges = this.flowChart.getEdgeList(vertex);
    if (edges.length === 0) return true;
    const flag = this.findNewPath(vertex, nowGridIndex, oldGridIndex, edges);
    if (flag) {
      const { pathArr, edgeDataArr } = flag;
      this.gridGraph.setVertexData(nowGridIndex, true);
      data.gridIndex = nowGridIndex;
      this.updateEdgeLine(nowGridIndex, pathArr, edgeDataArr, edges);
    } else {
      this.gridGraph.setVertexData(oldGridIndex, true);
      this.setEdgesPathUsed(edges, true);
    }
    return flag;
  }

  //检查拖动结果在网格图中是否合法
  private checkDragEnd(vertex: number, pt: Pt) {
    const data = this.flowChart.getVertexData(vertex);
    if (!data) return false;
    //新顶点是否存在
    const nowGridIndex = getGridIndex(pt, this.gridConfig);
    if (!this.checkVerter(nowGridIndex)) return false;
    if (this.checkDragVertexPath(vertex, pt)) {
      data.gridIndex = nowGridIndex;
      return true;
    } else {
      return false;
    }
  }

  private updateDropVertexStatus(config: DrawConfig) {
    const { drawStatus, operationStatus } = config;
    config.drawStatus = 0;
    config.operationStatus = 0;
    config.drawStatus = setBit(drawStatus, DrawStatusBit.CLICK, true);
    config.drawStatus = setBit(drawStatus, DrawStatusBit.DROPSHADOW, false);
    config.operationStatus = setBit(
      operationStatus,
      OperationStatusBit.DOWN,
      false
    );
  }

  private updateVertex(vertex: number) {
    const data = this.flowChart.getVertexData(vertex);
    if (!data) return;
    const pt = getPT(data.gridIndex, this.gridConfig);
    data.drawConfig.anchorX = pt.x;
    data.drawConfig.anchorY = pt.y;
    data.textConfig.anchorX = pt.x;
    data.textConfig.anchorY = pt.y;
    updateDrawConfig(data.drawConfig);
    //更新选中图形配置
    const clickConfig = createDrawClickConfig(data.drawConfig.box);
    this.backgroundLayer.setClickBox(clickConfig);
  }

  private onDragEnd() {
    this.inOperation = false;
    const data = this.flowChart.getVertexData(this.currentVertex);
    const pt = this.dynamicLayer.getCurrentConfigPt();
    this.dynamicLayer.clearConfig();
    this.dynamicLayer.drawCall();
    return { data, pt };
  }

  //停止拖动顶点
  private onDragVertexEnd() {
    const { data, pt } = this.onDragEnd();
    if (!data || !pt) return false;
    const config = data.drawConfig;
    //重置状态
    this.updateDropVertexStatus(config);
    if (this.checkDragEnd(this.currentVertex, pt)) {
      //成功移动，更新顶点
      this.updateVertex(this.currentVertex);
      this.updateBgConfig();
      this.backgroundLayer.drawCall();
    }
  }

  //拖动边开始
  private onDragEdgeStart(evt: DrapEventData) {
    if (this.currentVertex === -1) return;
    const config = createEdgeConfig([
      { x: evt.x, y: evt.y },
      { x: evt.x, y: evt.y },
    ]);
    if (!config) return;
    this.dynamicLayer.setEdgeConfig(config);
    this.inOperation = true;
  }

  //拖动边结束
  private onDragEdgeEnd() {
    const { pt } = this.onDragEnd();
    if (!pt) return;
    const inVertex = this.backgroundLayer.checkPoint(pt);
    console.log("inVertext", inVertex);
    if (inVertex === false || inVertex === this.currentVertex) return;
    this.insterEdge(this.currentVertex, inVertex);
  }

  //点击边
  private onEdgeClick(data: EdgeEventData) {
    this.currentVertex = -1;
    this.currentEdge = data.edge;
    const edgeData = this.flowChart.getEdgeData(data.edge.i, data.edge.j);
    if (edgeData && edgeData.textConfig) {
      edgeData.textConfig.operationStatus = setBit(
        edgeData.textConfig.operationStatus,
        OperationStatusBit.DOWN,
        false
      );
    }
  }

  //状态变化
  public onStatus(data: OperEventData) {
    const vertexData = this.flowChart.getVertexData(data.vertex);
    if (vertexData?.drawConfig) {
      const config = vertexData.drawConfig;
      const drawCall = this.setOperationStataus(config, data.layer);
      if (drawCall) this.backgroundLayer.drawCall();
    }
  }

  private showMessage(
    type: "success" | "warning" | "info" | "error",
    message: string
  ) {
    if (this.isShowMessage) {
      console.log(type, message);
    }
  }

  //检查顶点占用情况
  public checkVerter(gridIndex: number) {
    if (this.flowChart.gridExists(gridIndex)) {
      if (
        gridIndex !==
        this.flowChart.getVertexData(this.currentVertex)?.gridIndex
      )
        this.showMessage("warning", "该网格点已存在");
      return false;
    } else {
      return true;
    }
  }

  //插入新的顶点
  public insertVecter(
    data: InsertVertex,
    _gridIndex?: number,
    bpmnData?: VertexBPMNData
  ) {
    //开始和结束节点只能有一个
    const { hasStart, hasEnd } = this.checkHasNodes();
    if (data.vertexType === VertexType.START && hasStart !== false) {
      this.showMessage("warning", "只能有一个开始节点");
      return false;
    } else if (data.vertexType === VertexType.END && hasEnd !== false) {
      this.showMessage("warning", "只能有一个结束节点");
      return false;
    }
    const gridIndex =
      _gridIndex === undefined
        ? getGridIndex(data.pt, this.gridConfig)
        : _gridIndex;
    if (!this.checkVerter(gridIndex)) return false;
    const vertexData = createVertextData(
      data.vertexType,
      gridIndex,
      this.gridConfig,
      bpmnData
    );
    this.flowChart.insertVertex(vertexData);
    this.gridGraph.setVertexData(gridIndex, true);
    return true;
  }
  //删除顶点
  public removeVerter(i: number) {
    const vertexData = this.flowChart.getVertexData(i);
    if (!vertexData) {
      this.showMessage("warning", "点数据不存在");
      return false;
    }
    if (this.currentVertex === i) this.currentVertex = -1;
    this.flowChart.removeVertex(i);
    this.gridGraph.setVertexData(vertexData.gridIndex, false);
  }

  //根据网格路径获取真实路径
  private getLinePath(
    gridPath: Array<number>,
    gridConfig: GridConfig,
    i: number,
    j: number
  ) {
    const linePath: Array<Pt> = [];
    gridPath.forEach((gridIndex) => {
      const pt = getPT(gridIndex, gridConfig);
      linePath.push(pt);
    });
    const fristData = this.flowChart.getVertexData(i);
    if (fristData) {
      const fristPt = getGridPt(gridPath[0], gridConfig);
      const secondPt = getGridPt(gridPath[1], gridConfig);
      const offset = getOffset(fristData.drawConfig, fristPt, secondPt);
      linePath[0].x += offset.offsetX;
      linePath[0].y += offset.offsetY;
    }
    const lastData = this.flowChart.getVertexData(j);
    if (lastData) {
      const lastIndex = gridPath.length - 1;
      const fristPt = getGridPt(gridPath[lastIndex - 1], gridConfig);
      const secondPt = getGridPt(gridPath[lastIndex], gridConfig);
      const offset = getOffset(lastData.drawConfig, fristPt, secondPt, true);
      linePath[lastIndex].x += offset.offsetX;
      linePath[lastIndex].y += offset.offsetY;
    }
    return linePath;
  }

  private checkEdgePath(gridIndexI: number, gridIndexJ: number) {
    if (gridIndexI === undefined || gridIndexJ === undefined) return false;
    const path = this.gridGraph.findPath(gridIndexI, gridIndexJ);
    //通路不存在
    if (!path) {
      console.log("通路不存在");
      this.showMessage("warning", "通路不存在");
      return false;
    }
    return path;
  }

  //插入新的边
  public insterEdge(i: number, j: number, bpmnData?: EdgeBPMNData) {
    //已经存在
    if (this.flowChart.exists(i, j)) {
      this.showMessage("warning", "边已经存在");
      return false;
    }
    const vertexDataI = this.flowChart.getVertexData(i);
    const vertexDataJ = this.flowChart.getVertexData(j);
    if (!vertexDataI || !vertexDataJ) return false;
    const gridIndexI = vertexDataI.gridIndex;
    const gridIndexJ = vertexDataJ.gridIndex;
    const vertexDataIId = vertexDataI.vId;
    const vertexDataJId = vertexDataJ.vId;
    const path = this.checkEdgePath(gridIndexI, gridIndexJ);
    if (!path) return false;
    //边的数据
    const linePath = this.getLinePath(path, this.gridConfig, i, j);
    const disable = vertexDataI.type !== VertexType.BRANCH;
    //老数据处理
    if (bpmnData) {
      bpmnData.disable = disable;
      bpmnData.nodeCondition = 1;
    }
    const edgeData = createEdgeData(
      linePath,
      path,
      i,
      j,
      vertexDataIId,
      vertexDataJId,
      disable,
      bpmnData
    );
    if (!edgeData) {
      this.showMessage("warning", "边数据创建失败");
      return false;
    }
    edgeData.gridPath = path;
    //插入到流程图数据结构
    this.flowChart.insertEdge(edgeData, 1, i, j);
    //更新网格图边的占用情况
    this.gridGraph.updateEdgeData(path, true);
    //如果存在逆向边,则去掉
    const reverseEdge = this.flowChart.exists(j, i);
    if (reverseEdge) {
      this.flowChart.removeEdge(j, i);
      this.gridGraph.updateEdgeData(reverseEdge.data.gridPath, false);
    }
    this.showMessage("success", "操作成功");
  }

  //删除边
  public removeEdge(i: number, j: number) {
    const edge = this.flowChart.removeEdge(i, j);
    if (edge) {
      const path = edge.data.gridPath;
      //更新网格图边的占用情况
      this.gridGraph.updateEdgeData(path, false);
    }
    if (this.currentEdge.i === i && this.currentEdge.j === j) {
      this.currentEdge.i = -1;
      this.currentEdge.j = -1;
    }
  }

  public onInsterEdge(ij: [number, number]) {
    this.insterEdge(ij[0], ij[1]);
  }

  public onRemoveEdge(ij: [number, number]) {
    this.removeEdge(ij[0], ij[1]);
  }

  //删除当前选则的顶点或边
  public removeCurrent() {
    if (this.currentVertex !== -1) {
      this.onRemoveCurrentVertext();
    } else if (this.currentEdge.i !== -1 && this.currentEdge.j !== -1) {
      this.onRemoveCurrentEdge();
    } else {
      this.showMessage("warning", "未选择节点或条件");
    }
  }

  public onRemoveCurrentVertext() {
    if (this.currentVertex === -1) {
      this.showMessage("warning", "未选择节点");
      return;
    }
    this.removeVerter(this.currentVertex);
  }

  public onRemoveCurrentEdge() {
    if (this.currentEdge.i === -1 || this.currentEdge.j === -1) {
      this.showMessage("warning", "未选择条件");
      return;
    }
    this.removeEdge(this.currentEdge.i, this.currentEdge.j);
  }

  //检查当前流程图是否有开始,节点,结束
  public checkHasNodes() {
    const len = this.flowChart.getVertexNum();
    let hasStart: boolean | number = false;
    let hasNode: boolean | number = false;
    let hasEnd: boolean | number = false;
    for (let i = 0; i < len; i++) {
      const vertexData = this.flowChart.getVertexData(i);
      if (!vertexData) continue;
      if (vertexData.type === VertexType.START) {
        hasStart = i;
      } else if (vertexData.type === VertexType.NODE) {
        hasNode = i;
      } else if (vertexData.type === VertexType.END) {
        hasEnd = i;
      }
    }
    return { hasStart, hasNode, hasEnd };
  }

  //检查流程图的所有通路
  public checkFlowchartPath(start: number, end: number) {
    this.flowChart.reset();
    return this.flowChart.checkPath(start, end);
  }

  //保存
  public save(id: string, name: string | false) {
    //TODO 一系列图结构和数据完整性的检查
    const { hasStart, hasNode, hasEnd } = this.checkHasNodes();
    if (hasStart === false) {
      console.warn("缺少开始节点!");
      return false;
    }
    if (hasNode === false) {
      console.warn("缺少中间节点!");
      return false;
    }
    if (hasEnd === false) {
      console.warn("缺少结束节点!");
      return false;
    }
    if (!this.checkFlowchartPath(hasStart as number, hasEnd as number)) {
      console.warn("流程图通路不完整!");
      return false;
    }
    const xmlData = createXMLData(id, name, this.flowChart, this.gridConfig);
    if (!xmlData) {
      console.error("转换数据失败");
    }
    return xmlData;
  }

  //获取当前选中的顶点数据
  public getCurrentVerterData = () => {
    if (this.currentVertex === -1) return false;
    const vertexData = this.flowChart.getVertexData(this.currentVertex);
    return vertexData;
  };
  //获取当前选中的边数据
  public getCurrentEdgeData = () => {
    if (this.currentEdge.i === -1 || this.currentEdge.j === -1) return false;
    const edgeData = this.flowChart.getEdgeData(
      this.currentEdge.i,
      this.currentEdge.j
    );
    return edgeData;
  };

  public addEvents() {
    this.backgroundLayer.addEvents();
    this.dynamicLayer.addEvents();
    mitt.on("statusChanged", this.onStatus);
    mitt.on("insertVertex", this.insertVecter);
    mitt.on("removeVertex", this.removeVerter);
    mitt.on("insertEdge", this.onInsterEdge);
    mitt.on("removeEdge", this.onRemoveEdge);
    mitt.on("vertextClick", this.onVertextClick);
    mitt.on("dragVertexStart", this.onDragVertexStart);
    mitt.on("dragVertexEnd", this.onDragVertexEnd);
    mitt.on("dragEdgeStart", this.onDragEdgeStart);
    mitt.on("dragEdgeEnd", this.onDragEdgeEnd);
    mitt.on("edgeClick", this.onEdgeClick);
    mitt.on("removeCurrentVertext", this.onRemoveCurrentVertext);
    mitt.on("removeCurrentEdge", this.onRemoveCurrentEdge);
  }

  public removeEvents() {
    mitt.off("statusChanged", this.onStatus);
    mitt.off("insertVertex", this.insertVecter);
    mitt.off("removeVertex", this.removeVerter);
    mitt.off("insertEdge", this.onInsterEdge);
    mitt.off("removeEdge", this.onRemoveEdge);
    mitt.off("vertextClick", this.onVertextClick);
    mitt.off("dragVertexStart", this.onDragVertexStart);
    mitt.off("dragVertexEnd", this.onDragVertexEnd);
    mitt.off("dragEdgeStart", this.onDragEdgeStart);
    mitt.off("dragEdgeEnd", this.onDragEdgeEnd);
    mitt.off("edgeClick", this.onEdgeClick);
    mitt.off("removeCurrentVertext", this.onRemoveCurrentVertext);
    mitt.off("removeCurrentEdge", this.onRemoveCurrentEdge);
    this.backgroundLayer.removeEvents();
    this.dynamicLayer.removeEvents();
  }

  public dispose() {
    this.removeEvents();
    this.backgroundLayer.dispose();
    this.dynamicLayer.dispose();
    this.flowChart.dispose();
    this.gridGraph.dispose();
  }
}
