import { checkBit, setBit } from "@/util/math";
import { updateEdgeLine } from "./graph";
import mitt from "./mitt";
//图形的操作位状态 鼠标移入,点击下，移动，点击起
export enum OperationStatusBit {
  HOVER,
  DOWN,
  MOVE,
  Up,
}
//图形的绘制位状态 阴影,选中,拖动,拖动虚化
export enum DrawStatusBit {
  SHADOW,
  CLICK,
  DROP,
  DROPSHADOW,
}
//图形类型 圆角，矩形，多边形
export enum GraphType {
  ARC,
  RECT,
  POLYGON,
}
//图层
export enum LayerType {
  BG,
  TOP,
}
//盒子x1 x2 y1 y2
export type Box = [number, number, number, number];
//位置
export interface Pt {
  x: number;
  y: number;
}
//检查点是否在盒子内
const checkIn = (x: number, y: number, box: Box) => {
  return x >= box[0] && x <= box[1] && y >= box[2] && y <= box[3];
};
//图形锚点位置  圆形圆心为锚点
export interface AnchorPoint {
  anchorX: number;
  anchorY: number;
}

export type RGBData = [number, number, number];
//基础样式
export interface BaseStyle {
  //描边样式
  strokeStyle?: string;
  //填充样式
  fillStyle?: RGBData;
}

export const defaultRGB: RGBData = [28, 147, 153];
export interface BaseConfig extends AnchorPoint, BaseStyle {
  //图形类型
  graphType: GraphType;
  //操作状态
  operationStatus: OperationStatusBit;
  //附加绘图状态
  drawStatus: DrawStatusBit;
  //判定盒
  box: Box;
}

//处理填充和描边
const onFillAndStroke = (
  ctx: CanvasRenderingContext2D,
  config: BaseConfig,
  a?: number
) => {
  const rgb = config.fillStyle ? config.fillStyle : defaultRGB;
  const alpha = a ? a : 1;
  ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  if (config.strokeStyle) {
    ctx.strokeStyle = config.strokeStyle;
    ctx.stroke();
  }
  ctx.fill();
};

//绘制虚线
const addDotted = (ctx: CanvasRenderingContext2D, box: Box, offset: number) => {
  //线段和间隙的交替
  ctx.save();
  ctx.setLineDash([4, 2]);
  //起始偏移量
  ctx.lineDashOffset = -5;
  const alpha = 0.5;
  ctx.strokeStyle = `rgba(${defaultRGB[0]},${defaultRGB[1]},${defaultRGB[2]},${alpha})`;
  ctx.strokeRect(
    box[0] - offset,
    box[2] - offset,
    box[1] - box[0] + offset * 2,
    box[3] - box[2] + offset * 2
  );
  ctx.restore();
};

//绘制阴影
const addShadow = (ctx: CanvasRenderingContext2D) => {
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
};

//圆形配置数据
export interface ArcConfig extends BaseConfig {
  graphType: GraphType.ARC;
  //半径
  r: number;
  //起止弧度
  startAngle: number;
  endAngle: number;
}

//绘制圆弧
export const drawArc = (ctx: CanvasRenderingContext2D, config: ArcConfig) => {
  ctx.save();
  ctx.beginPath();
  if (checkBit(config.drawStatus, DrawStatusBit.SHADOW)) {
    addShadow(ctx);
  }
  ctx.arc(
    config.anchorX,
    config.anchorY,
    config.r,
    config.startAngle,
    config.endAngle
  );
  ctx.closePath();
  const alpha = checkBit(config.drawStatus, DrawStatusBit.DROPSHADOW) ? 0.5 : 1;
  onFillAndStroke(ctx, config, alpha);
  ctx.restore();
};

//四(多)边形配置数据
export interface PolygonConfig extends BaseConfig {
  graphType: GraphType.POLYGON;
  //路径
  path: Array<Pt>;
}

//带圆角的矩形
export interface RectConfig extends BaseConfig {
  graphType: GraphType.RECT;
  //坐标
  x: number;
  y: number;
  //宽
  width: number;
  //高
  height: number;
  //圆角
  radius?: number;
}

//绘制带圆角的矩形
export const drawRect = (ctx: CanvasRenderingContext2D, config: RectConfig) => {
  ctx.save();
  ctx.beginPath();
  if (checkBit(config.drawStatus, DrawStatusBit.SHADOW)) {
    addShadow(ctx);
  }
  const { x, y, height, width } = config;
  const radius = config.radius ? config.radius : 0;
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  ctx.closePath();
  const alpha = checkBit(config.drawStatus, DrawStatusBit.DROPSHADOW) ? 0.5 : 1;
  onFillAndStroke(ctx, config, alpha);
  ctx.restore();
};

//绘制多边形
export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  config: PolygonConfig
) => {
  ctx.save();
  ctx.beginPath();
  if (checkBit(config.drawStatus, DrawStatusBit.SHADOW)) {
    addShadow(ctx);
  }
  const { path } = config;
  path.forEach((pt, index) => {
    if (index === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  });
  ctx.closePath();
  const alpha = checkBit(config.drawStatus, DrawStatusBit.DROPSHADOW) ? 0.5 : 1;
  onFillAndStroke(ctx, config, alpha);
  ctx.restore();
};

export interface TextConfig extends AnchorPoint {
  //如果是边的文字,需要知道是哪条边
  i?: number;
  j?: number;
  //最大宽度
  maxWidth: number;
  //字体
  font: string;
  //字号
  size: number;
  //文字
  text: string;
  //文字颜色
  fillStyle: string;
  //操作状态
  operationStatus: OperationStatusBit;
  //行间距
  lineSpace: number;
  box?: Box;
}

//获取文字高度
export const getTextH = (ctx: CanvasRenderingContext2D, config: TextConfig) => {
  const { text } = config;
  let lineStr = "";
  const lines: Array<string> = [];
  for (let i = 0, l = text.length; i < l; i++) {
    lineStr += text[i];
    const { width } = ctx.measureText(lineStr);
    if (width > config.maxWidth) {
      lines.push(lineStr);
      lineStr = "";
    }
    if (i === l - 1 && lineStr) {
      lines.push(lineStr);
    }
  }
  //行间距
  const { lineSpace } = config;
  const lineHeight = config.size + lineSpace;
  return lineHeight * lines.length;
};

//绘制文字
const drawText = (ctx: CanvasRenderingContext2D, config: TextConfig) => {
  ctx.save();
  ctx.font = `${config.size}px ${config.font}`;
  ctx.fillStyle = config.fillStyle;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines: Array<string> = [];
  let lineStr = "";
  const { text } = config;
  for (let i = 0, l = text.length; i < l; i++) {
    lineStr += text[i];
    const { width } = ctx.measureText(lineStr);
    if (width > config.maxWidth) {
      lines.push(lineStr);
      lineStr = "";
    }
    if (i === l - 1 && lineStr) {
      lines.push(lineStr);
    }
  }
  //行间距
  const { lineSpace } = config;
  const lineHeight = config.size + lineSpace;
  //起点
  const startX = Math.floor(config.anchorX);
  const startY = Math.floor(
    config.anchorY -
      config.size / 2 -
      (lines.length * lineHeight - lineSpace) / 2
  );
  lines.forEach((item, index) => {
    ctx.fillText(
      item,
      startX,
      startY + lineHeight * (index + 1),
      config.maxWidth
    );
  });
  const endY = startY + lineHeight * lines.length;
  const x1 = Math.floor(startX - config.maxWidth / 2);
  const x2 = Math.floor(startX + config.maxWidth / 2);
  config.box = [x1, x2, startY, endY];
  ctx.restore();
};

const defaultRectH = 46;
const defaultRectW = 142;
const defaultR = 35;

const getArcBox = (pt: AnchorPoint, r: number): Box => {
  return [pt.anchorX - r, pt.anchorX + r, pt.anchorY - r, pt.anchorY + r];
};

const getRectBox = (pt: AnchorPoint, w: number, h: number): Box => {
  const wHalf = Math.floor(w / 2);
  const hHalf = Math.floor(h / 2);
  return [
    pt.anchorX - wHalf,
    pt.anchorX + wHalf,
    pt.anchorY - hHalf,
    pt.anchorY + hHalf,
  ];
};

// const getPolygonBox = (pt:AnchorPoint, path:Array<Pt>):Box => {
//   let minX = 0
//   let maxX = 0
//   let minY = 0
//   let maxY = 0
//   path.forEach((pt) => {
//     if (!minX) minX = pt.x
//     if (!maxX) maxX = pt.x
//     if (!minY) minY = pt.y
//     if (!maxY) maxY = pt.y
//     if (minX > pt.x) minX = pt.x
//     if (maxX < pt.x) maxX = pt.x
//     if (minY > pt.y) minY = pt.y
//     if (maxX < pt.y) maxY = pt.y
//   })
//   const wHalf = Math.floor((maxX - minX) / 2)
//   const hHalf = Math.floor((maxY - minY) / 2)
//   return [pt.anchorX - wHalf, pt.anchorX + wHalf, pt.anchorY - hHalf, pt.anchorY + hHalf]
// }

//顶点图形数据
export type DrawConfig = ArcConfig | RectConfig | PolygonConfig;

const getRectInfor = (
  anchorX: number,
  anchorY: number,
  w: number,
  h: number
) => {
  const x = anchorX - Math.floor(w / 2);
  const y = anchorY - Math.floor(h / 2);
  const width = w;
  const height = h;
  const box = getRectBox({ anchorX, anchorY }, width, height);
  return { x, y, width, height, box };
};

const getPolyInfor = (
  anchorX: number,
  anchorY: number,
  w: number,
  h: number
) => {
  const path: Array<Pt> = [];
  const wHalf = Math.floor(w / 2);
  const hHalf = Math.floor(h / 2);
  path.push({ x: anchorX - wHalf, y: anchorY });
  path.push({ x: anchorX, y: anchorY - hHalf });
  path.push({ x: anchorX + wHalf, y: anchorY });
  path.push({ x: anchorX, y: anchorY + hHalf });
  const box: Box = [
    anchorX - wHalf,
    anchorX + wHalf,
    anchorY - hHalf,
    anchorY + hHalf,
  ];
  return { box, path };
};

//创建图形配置
export const createDrawConfig = (
  graphType: GraphType,
  pt: Pt,
  _r?: number,
  _w?: number,
  _h?: number,
  _radius?: number
): DrawConfig => {
  const anchorX = pt.x;
  const anchorY = pt.y;
  const strokeStyle = "#1A7B80";
  const operationStatus = 0;
  const drawStatus = 0;
  const fillStyle: RGBData = defaultRGB;
  const base = {
    anchorX,
    anchorY,
    strokeStyle,
    operationStatus,
    drawStatus,
    fillStyle,
  };
  const r = _r ? _r : defaultR;
  const w = _w ? _w : defaultRectW;
  const h = _h ? _h : defaultRectH;
  if (graphType === GraphType.ARC) {
    const startAngle = 0;
    const endAngle = Math.PI * 2;
    const box = getArcBox({ anchorX, anchorY }, r);
    return { ...base, r, startAngle, endAngle, box, graphType };
  } else if (graphType === GraphType.RECT) {
    const radius = _radius ? _radius : 4;
    const { x, y, width, height, box } = getRectInfor(anchorX, anchorY, w, h);
    return { ...base, x, y, width, height, radius, box, graphType };
  } else {
    const { box, path } = getPolyInfor(anchorX, anchorY, w, h);
    return { ...base, box, path, graphType };
  }
};

//图形锚点更新，更新相关的图形配置
export const updateDrawConfig = (config: DrawConfig) => {
  const { anchorX, anchorY } = config;
  if (config.graphType === GraphType.RECT) {
    const { x, y, width, height, box } = getRectInfor(
      config.anchorX,
      config.anchorY,
      config.width,
      config.height
    );
    config.x = x;
    config.y = y;
    config.width = width;
    config.height = height;
    config.box = box;
  } else if (config.graphType === GraphType.POLYGON) {
    const oldBox = config.box;
    const w = oldBox[1] - oldBox[0];
    const h = oldBox[3] - oldBox[2];
    const { box, path } = getPolyInfor(anchorX, anchorY, w, h);
    config.box = box;
    config.path = path;
  } else if (config.graphType === GraphType.ARC) {
    const box = getArcBox(
      { anchorX: config.anchorX, anchorY: config.anchorY },
      config.r
    );
    config.box = box;
  }
};

//创建默认文字配置
export const createTextConfig = (
  pt: Pt,
  text: string,
  maxWidth: number,
  i?: number,
  j?: number
): TextConfig => {
  const anchorX = pt.x;
  const anchorY = pt.y;
  const font = "Microsoft YaHei";
  const size = 15;
  const fillStyle = "#ffffff";
  const operationStatus = 0;
  const lineSpace = 5;
  return {
    anchorX,
    anchorY,
    font,
    size,
    fillStyle,
    operationStatus,
    lineSpace,
    maxWidth,
    text,
    i,
    j,
  };
};

type ArcPoints = [Pt, Pt, Pt, Pt];
type ArcBoxs = [Box, Box, Box, Box];
//选中状态配置
export interface DrawClickConfig {
  box: Box;
  arcPoints: ArcPoints;
  arcBoxs: ArcBoxs;
}

const clickOffset = 10;
const clickArcR = 3;
const getArcPoint = (_box: Box) => {
  const box: Box = [
    _box[0] - clickOffset,
    _box[1] + clickOffset,
    _box[2] - clickOffset,
    _box[3] + clickOffset,
  ];
  const wHalf = Math.floor((box[1] - box[0]) / 2);
  const hHalf = Math.floor((box[3] - box[2]) / 2);
  const centerX = box[0] + wHalf;
  const cneterY = box[2] + hHalf;
  const arcPoints: Array<Pt> = [];
  //上下左右
  arcPoints.push({ x: centerX, y: box[2] });
  arcPoints.push({ x: centerX, y: box[3] });
  arcPoints.push({ x: box[0], y: cneterY });
  arcPoints.push({ x: box[1], y: cneterY });
  return arcPoints;
};

//可点击区域
const getArcBoxs = (arcPoints: ArcPoints) => {
  const arcBoxs: Array<Box> = [];
  const r = clickArcR + 10;
  arcPoints.forEach((pt) => {
    arcBoxs.push([pt.x - r, pt.x + r, pt.y - r, pt.y + r]);
  });
  return arcBoxs;
};

export const createDrawClickConfig = (box: Box): DrawClickConfig => {
  const arcPoints = getArcPoint(box) as ArcPoints;
  const arcBoxs = getArcBoxs(arcPoints) as ArcBoxs;
  return { box, arcPoints, arcBoxs };
};

//绘制选中状态
const drawClick = (ctx: CanvasRenderingContext2D, config: DrawClickConfig) => {
  const { box, arcPoints } = config;
  addDotted(ctx, box, clickOffset);
  const r = clickArcR;
  const radians = [Math.PI, 0, Math.PI / 2, (Math.PI * 3) / 2];
  arcPoints.forEach((pt, index) => {
    const config = createDrawConfig(GraphType.ARC, pt, r) as ArcConfig;
    drawArc(ctx, config);
    ctx.save();
    //三角
    ctx.beginPath();
    ctx.fillStyle = `rgba(${defaultRGB[0]},${defaultRGB[1]},${defaultRGB[2]},0.5)`;
    const rectH = 6;
    const arrowW = 4;
    ctx.translate(pt.x, pt.y);
    ctx.rotate(radians[index]);
    const halfArrowW = Math.floor(arrowW / 2);
    ctx.moveTo(r, halfArrowW);
    ctx.lineTo(r, halfArrowW + rectH);
    ctx.lineTo(r + halfArrowW, halfArrowW + rectH);
    ctx.lineTo(0, halfArrowW + rectH * 2);
    ctx.lineTo(-r - halfArrowW, halfArrowW + rectH);
    ctx.lineTo(-r, halfArrowW + rectH);
    ctx.lineTo(-r, halfArrowW);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
};

export interface EdgeConfig extends AnchorPoint {
  //直线路径
  linePath: Array<Pt>;
  //箭头三角形边长
  arrowW?: number;
  //箭头弧度
  arrowRadian: number;
  fillStyle: string;
  strokeStyle: string;
}

export const defaultArrowW = 8;

//绘制边
export const drawEdge = (
  ctx: CanvasRenderingContext2D,
  edgeConfig: EdgeConfig
) => {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = edgeConfig.strokeStyle;
  edgeConfig.linePath.forEach((pt, index) => {
    if (index === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  });
  ctx.stroke();
  const lastPt = edgeConfig.linePath[edgeConfig.linePath.length - 1];
  ctx.translate(lastPt.x, lastPt.y);
  ctx.rotate(edgeConfig.arrowRadian);
  ctx.beginPath();
  ctx.fillStyle = edgeConfig.fillStyle;
  const arrowW = edgeConfig.arrowW ? edgeConfig.arrowW : defaultArrowW;
  const left = Math.floor(-arrowW);
  const right = Math.floor(arrowW);
  const top = Math.floor(-arrowW * 2);
  ctx.moveTo(left, 0);
  ctx.lineTo(right, 0);
  ctx.lineTo(0, top);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const getEdgeArrowRadian = (linePath: Array<Pt>) => {
  const lastPt = linePath[linePath.length - 1];
  const beforLastPt = linePath[linePath.length - 2];
  return (
    Math.atan2(lastPt.y - beforLastPt.y, lastPt.x - beforLastPt.x) + Math.PI / 2
  );
};

//创建边配置
export const createEdgeConfig = (linePath: Array<Pt>): EdgeConfig | false => {
  if (linePath.length < 2) return false;
  const fristPt = linePath[0];
  const lastPt = linePath[linePath.length - 1];
  const anchorX = Math.floor((fristPt.x - lastPt.x) / 2);
  const anchorY = Math.floor((fristPt.y - lastPt.y) / 2);
  const fillStyle = "#000000";
  const strokeStyle = "#000000";
  const arrowRadian = getEdgeArrowRadian(linePath);
  const arrowW = 8;
  return {
    anchorX,
    anchorY,
    fillStyle,
    strokeStyle,
    linePath,
    arrowW,
    arrowRadian,
  };
};

/**canvas图层 */
export class Layer {
  //图层
  protected ctx: CanvasRenderingContext2D | null;
  protected canvas: HTMLCanvasElement | null;
  //鼠标位置
  protected mousePt: Pt | null;
  protected offsetX = 0;
  protected offsetY = 0;
  constructor(_ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement) {
    this.ctx = _ctx;
    this.canvas = _canvas;
    this.mousePt = null;
  }

  protected clearCanvas() {
    if (!this.ctx || !this.canvas) return false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  //绘制图形
  protected drawGraph(ctx: CanvasRenderingContext2D, config: DrawConfig) {
    switch (config.graphType) {
      case GraphType.ARC:
        drawArc(ctx, config);
        break;
      case GraphType.RECT:
        drawRect(ctx, config);
        break;
      case GraphType.POLYGON:
        drawPolygon(ctx, config);
        break;
    }
  }

  protected resetStatus(config: BaseConfig | TextConfig) {
    config.operationStatus = 0;
  }

  //点击
  protected checkClick(status: OperationStatusBit) {
    return checkBit(status, OperationStatusBit.DOWN);
  }

  //拖动中
  protected checkDropMove(status: OperationStatusBit) {
    return (
      checkBit(status, OperationStatusBit.DOWN) &&
      checkBit(status, OperationStatusBit.MOVE)
    );
  }
  //拖动完成
  protected checkDropUp(status: OperationStatusBit) {
    return checkBit(status, OperationStatusBit.Up);
  }

  public dispose() {
    this.clearCanvas();
    this.ctx = null;
    this.canvas = null;
  }
}

export class BgLayer extends Layer {
  //图层
  private _layerType: LayerType = LayerType.BG;
  //图形配置
  private graphConfigs: Array<DrawConfig> | null;
  private textCongfigs: Array<TextConfig> | null;
  private edgeConfigs: Array<EdgeConfig> | null;
  private edgeTextConfigs: Array<TextConfig> | null;
  //当前点击对象的box
  private clickBox: DrawClickConfig | null;
  constructor(_ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement) {
    super(_ctx, _canvas);
    this.graphConfigs = null;
    this.textCongfigs = null;
    this.edgeConfigs = null;
    this.edgeTextConfigs = null;
    this.clickBox = null;
    this.mousePt = null;
    this.initBind();
  }

  private initBind() {
    const self = this;
    this.onMouseMove = this.onMouseMove.bind(self);
    this.onMouseDown = this.onMouseDown.bind(self);
    this.onMouseUp = this.onMouseUp.bind(self);
    this.onMouseOut = this.onMouseOut.bind(self);
  }

  public get layerType() {
    return this._layerType;
  }

  //检查点是否在某个图形中
  public checkPoint(pt: Pt) {
    if (!this.graphConfigs) return false;
    for (let i = 0, l = this.graphConfigs.length; i < l; i++) {
      const config = this.graphConfigs[i];
      if (checkIn(pt.x, pt.y, config.box)) {
        return i;
      }
    }
    return false;
  }

  //清空并重绘图形
  public drawCall() {
    if (!this.ctx || !this.canvas) return false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.graphConfigs?.forEach((config) => {
      this.drawGraph(this.ctx as CanvasRenderingContext2D, config);
    });
    this.textCongfigs?.forEach((config) => {
      drawText(this.ctx as CanvasRenderingContext2D, config);
    });
    this.edgeConfigs?.forEach((config) => {
      drawEdge(this.ctx as CanvasRenderingContext2D, config);
    });
    this.edgeTextConfigs?.forEach((config) => {
      drawText(this.ctx as CanvasRenderingContext2D, config);
    });
    //选中状态
    if (this.clickBox) drawClick(this.ctx, this.clickBox);
  }

  //设置图形和文字配置
  public setConfigs(
    _graphConfigs: Array<DrawConfig>,
    _textCongfigs: Array<TextConfig>,
    _edgeConfigs: Array<EdgeConfig>,
    _edgeTextConfigs: Array<TextConfig>
  ) {
    if (!this.ctx || !this.canvas) return false;
    this.graphConfigs = _graphConfigs;
    this.textCongfigs = _textCongfigs;
    this.edgeConfigs = _edgeConfigs;
    this.edgeTextConfigs = _edgeTextConfigs;
  }

  public getGraphConfigs() {
    return this.graphConfigs;
  }

  //设置选中图形
  public setClickBox(clickBox: DrawClickConfig | null) {
    this.clickBox = clickBox;
  }

  private pollingStatus(pt: Pt, operationStatus: OperationStatusBit) {
    //TODO 可以优化
    let drawflag = false;
    if (this.graphConfigs) {
      this.graphConfigs.forEach((config, i) => {
        const isStatus = checkIn(pt.x, pt.y, config.box);
        const lastHover = checkBit(config.operationStatus, operationStatus);
        const changed = isStatus !== lastHover;
        config.operationStatus = setBit(
          config.operationStatus,
          operationStatus,
          isStatus
        );
        if (changed) {
          drawflag = true;
          mitt.emit("statusChanged", { vertex: i, layer: this._layerType });
        }
        if (this.checkClick(config.operationStatus)) {
          drawflag = true;
          mitt.emit("vertextClick", { vertex: i, layer: this._layerType });
        }
        if (this.checkDropMove(config.operationStatus)) {
          drawflag = true;
          mitt.emit("dragVertexStart", {
            vertex: i,
            layer: this._layerType,
            x: pt.x,
            y: pt.y,
          });
        }
      });
    }
    if (this.edgeTextConfigs) {
      this.edgeTextConfigs.forEach((config) => {
        if (config.i !== undefined && config.j !== undefined && config.box) {
          const isStatus = checkIn(pt.x, pt.y, config.box);
          config.operationStatus = setBit(
            config.operationStatus,
            operationStatus,
            isStatus
          );
          if (this.checkClick(config.operationStatus)) {
            mitt.emit("edgeClick", {
              layer: this._layerType,
              edge: { i: config.i, j: config.j },
            });
          }
        }
      });
    }
    //选中顶点的四个区域
    if (operationStatus === OperationStatusBit.DOWN && this.clickBox) {
      const { arcBoxs } = this.clickBox;
      for (let i = 0, l = arcBoxs.length; i < l; i++) {
        if (checkIn(pt.x, pt.y, arcBoxs[i])) {
          mitt.emit("dragEdgeStart", {
            vertex: -1,
            layer: this._layerType,
            x: pt.x,
            y: pt.y,
          });
          break;
        }
      }
    }
    return drawflag;
  }

  private onMouseMove(evt: MouseEvent) {
    this.offsetX = this.mousePt ? evt.offsetX - this.mousePt.x : 0;
    this.offsetY = this.mousePt ? evt.offsetY - this.mousePt.x : 0;
    this.mousePt = { x: evt.offsetX, y: evt.offsetY };
    evt.preventDefault();
    this.pollingStatus(
      { x: evt.offsetX, y: evt.offsetY },
      OperationStatusBit.HOVER
    );
    this.pollingStatus(
      { x: evt.offsetX, y: evt.offsetY },
      OperationStatusBit.MOVE
    );
  }

  private onMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    this.pollingStatus(
      { x: evt.offsetX, y: evt.offsetY },
      OperationStatusBit.DOWN
    );
  }

  private onMouseUp(evt: MouseEvent) {
    evt.preventDefault();
    this.pollingStatus(
      { x: evt.offsetX, y: evt.offsetY },
      OperationStatusBit.Up
    );
  }

  private onMouseOut(evt: MouseEvent) {
    evt.preventDefault();
    this.mousePt = null;
  }

  //添加操作监听
  public addEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("mouseout", this.onMouseOut);
  }

  //移除操作监听
  public removeEvents() {
    if (!this.canvas) return;
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("mouseout", this.onMouseOut);
  }

  public dispose() {
    this.removeEvents();
    super.dispose();
    this.graphConfigs = null;
    this.textCongfigs = null;
    this.edgeConfigs = null;
    this.textCongfigs = null;
    this.clickBox = null;
  }
}

export class TopLayer extends Layer {
  //图层
  private _layerType: LayerType = LayerType.BG;
  //需要移动图形时，动态渲染的帧数 0为关闭
  private _frame = 0;
  //最大60帧
  private maxFrame = 120;
  //根据帧数计算出的时间间隔
  private timeInterval = 0;
  //上一次渲染时间
  private lastTime = 0;
  //当前顶点
  private currentVertexConfig: DrawConfig | null;
  //当前边
  private currentEdgeConfig: EdgeConfig | null;
  constructor(_ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement) {
    super(_ctx, _canvas);
    this.mousePt = null;
    this.currentVertexConfig = null;
    this.currentEdgeConfig = null;
    this.initBind();
  }

  private initBind() {
    const self = this;
    this.onMouseMove = this.onMouseMove.bind(self);
    this.onMouseUp = this.onMouseUp.bind(self);
    this.onMouseOut = this.onMouseOut.bind(self);
    this.onFrame = this.onFrame.bind(self);
  }

  public get layerType() {
    return this._layerType;
  }

  //不做细致的帧渲染
  private onFrame() {
    if (!this._frame) return;
    if (!this.lastTime) this.lastTime = 0;
    const time = Date.now();
    const draw = time >= this.lastTime + this.timeInterval;
    if (draw) {
      this.lastTime = time;
      this.drawCall();
    }
    window.requestAnimationFrame(this.onFrame);
  }

  //设置每帧渲染 0为停止
  public set frame(value: number) {
    this._frame = value;
    if (value) {
      if (this._frame > this.maxFrame) this._frame = this.maxFrame;
      this.timeInterval = 1000 / this._frame;
      this.lastTime = Date.now();
      this.drawCall();
      this.onFrame();
    }
  }

  //设置当前图形
  public setDrawConfig(config: DrawConfig) {
    this.currentVertexConfig = config;
    this.currentEdgeConfig = null;
  }

  //获取当前图形的位置
  public getCurrentConfigPt(): Pt | false {
    if (this.currentVertexConfig) {
      return {
        x: this.currentVertexConfig.anchorX,
        y: this.currentVertexConfig.anchorY,
      };
    } else if (this.currentEdgeConfig) {
      return {
        x: this.currentEdgeConfig.anchorX,
        y: this.currentEdgeConfig.anchorY,
      };
    } else {
      return false;
    }
  }

  //设置当前边
  public setEdgeConfig(config: EdgeConfig) {
    this.currentEdgeConfig = config;
    this.currentVertexConfig = null;
  }

  //清空并重绘图形
  public drawCall() {
    if (!this.ctx || !this.canvas) return false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.currentVertexConfig) {
      this.drawGraph(
        this.ctx as CanvasRenderingContext2D,
        this.currentVertexConfig
      );
    }
    if (this.currentEdgeConfig) {
      drawEdge(this.ctx as CanvasRenderingContext2D, this.currentEdgeConfig);
    }
  }

  private onMouseMove(evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.offsetX = this.mousePt ? evt.offsetX - this.mousePt.x : 0;
    this.offsetY = this.mousePt ? evt.offsetY - this.mousePt.y : 0;
    this.mousePt = { x: evt.offsetX, y: evt.offsetY };
    if (this.offsetX || this.offsetY) {
      if (this.currentVertexConfig) {
        this.currentVertexConfig.anchorX = evt.offsetX;
        this.currentVertexConfig.anchorY = evt.offsetY;
        updateDrawConfig(this.currentVertexConfig);
        //最快同步
        this.onFrame();
      } else if (this.currentEdgeConfig) {
        this.currentEdgeConfig.anchorX = evt.offsetX;
        this.currentEdgeConfig.anchorY = evt.offsetY;
        const { linePath } = this.currentEdgeConfig;
        linePath[1].x = evt.offsetX;
        linePath[1].y = evt.offsetY;
        updateEdgeLine(this.currentEdgeConfig, linePath);
        //最快同步
        this.onFrame();
      }
    }
  }

  private onDragEnd() {
    if (this.currentVertexConfig) {
      mitt.emit("dragVertexEnd", {
        x: this.currentVertexConfig.anchorX,
        y: this.currentVertexConfig.anchorY,
      });
    }
    if (this.currentEdgeConfig) {
      mitt.emit("dragEdgeEnd", {
        x: this.currentEdgeConfig.anchorX,
        y: this.currentEdgeConfig.anchorY,
      });
    }
  }

  private onMouseUp(evt: MouseEvent) {
    evt.preventDefault();
    this.onDragEnd();
  }

  private onMouseOut(evt: MouseEvent) {
    evt.preventDefault();
    this.onDragEnd();
  }

  public clearConfig() {
    this.currentVertexConfig = null;
    this.currentEdgeConfig = null;
  }

  //添加操作监听
  public addEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("mouseout", this.onMouseOut);
  }

  //移除操作监听
  public removeEvents() {
    if (!this.canvas) return;
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("mouseout", this.onMouseOut);
  }

  public dispose() {
    this.removeEvents();
    super.dispose();
    this._frame = 0;
    this.lastTime = 0;
    this.timeInterval = 0;
    this.ctx = null;
    this.canvas = null;
  }
}
