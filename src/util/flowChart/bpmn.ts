/**生成和解析BPNM数据 */
type Dictionary<T> = { [key: string]: T };
import FlowChart from "./graph";
import {
  GridConfig,
  VertexType,
  getGridPt,
  getGridIndexByGridPt,
} from "./graph";
import { Pt } from "./canvas";
//类型
export interface StartType {
  type: VertexType.START;
}
export interface NodeType {
  type: VertexType.NODE;
}
export interface BranchType {
  type: VertexType.BRANCH;
}
export interface EndType {
  type: VertexType.END;
}

export type FromStartType = Partial<StartType>;
export type FromNodeType = Partial<NodeType>;
export type FromBranchType = Partial<BranchType>;
export type FromEndType = Partial<EndType>;
/**开始节点 */
//节点基础数据
export interface BaseData {
  //节点ID
  id: string;
  //节点名称
  name: string;
  //节点说明
  documentation?: string;
}

//发起人数据
export interface PromoterData {
  //可发起部门 {机构id:[id1,id2]}
  orgPromoters?: Dictionary<Array<string>>;
  //可发起人
  userPromoters?: Array<string>;
  //可发起职位类别
  postPromoters?: Array<string>;
}
//抄送人数据
export interface CcData {
  //抄送人
  notifiers?: Array<string>;
}

//节点基础表单数据
export type FromBaseData = Partial<BaseData>;
//发起人表单内容
export type FromPromoterData = PromoterData;
//抄送人表单数据
export type FromCcData = CcData;

//开始节点数据
export type BPMNStartData = StartType & BaseData & PromoterData & CcData;
//开始节点表单数据
export type FromStartData = FromStartType &
  FromBaseData &
  FromPromoterData &
  FromCcData;

/**一般节点 */
export type BINDATA = 0 | 1;
//一般节点基础数据
export interface NodeBaseData extends BaseData {
  //允许撤回
  canRevoke: BINDATA;
  //审批方式 会签 或签
  approvalMethod: BINDATA;
  //允许加签
  allowSigning: BINDATA;
  //是否回调
  call: BINDATA;
  //回调地址
  callAddress?: string;
  //数据权限
  dataPermission?: Array<string>;
}
//审批人数据
export interface ApproverData {
  //指定部门(负责人)
  orgApprovalers?: Dictionary<Array<string>>;
  //指定审批人
  userApprovalers?: Array<string>;
  //指定职务
  postApprovalers?: Array<string>;
}
//一般节点数据
export type BPMNNodeData = NodeType & NodeBaseData & ApproverData & CcData;

//一般节点表单基础数据
export type FromNodeBaseData = Partial<NodeBaseData>;
//审批人表单数据
export type FromApproverData = ApproverData;
//一般节点表单数据
export type FromNodeData = FromNodeType &
  FromNodeBaseData &
  FromApproverData &
  FromCcData;

/**分支节点 */
//分支节点数据
export type BPMNBranchData = BranchType & BaseData;
//分支节点表单数据
export type FromBranchData = FromBranchType & FromBaseData;

/**结束节点 */
//结束节点数据
export type BPMNEndData = BaseData & EndType;

//结束节点表单数据
export type FromEndData = Partial<BPMNEndData>;

//流转基础 (边的数据)
export interface CirculatBaseData {
  //流转id
  id: string;
  //优先级
  priority: number;
  //起止点id
  sourceRef: string;
  targetRef: string;
  //节点条件 (通过/不通过)
  nodeCondition: BINDATA;
  disable?: boolean;
}
//流转条件
export interface CirculatConditionData {
  //条件名称
  conditionName: string;
  //条件表达式
  CDATA?: string;
}
//流转数据
export type CirculatData = CirculatBaseData & CirculatConditionData;
//流转表单数据
export type FromCirculatData = Partial<CirculatData>;

//顶点审批流数据
export type VertexBPMNData =
  | BPMNStartData
  | BPMNNodeData
  | BPMNBranchData
  | BPMNEndData;

//顶点数据验证

//边的审批流数据
export type EdgeBPMNData = CirculatData;

export type FromVertexBPMNData = Partial<VertexBPMNData>;
export type FromEdgeBPMNData = Partial<EdgeBPMNData>;
//展示数据
export type FromDisplayData = FromVertexBPMNData | FromEdgeBPMNData | null;

//创建BPMN的id
export const createBPNMId = (suffix?: string) => {
  const id = "sid-" + Date.now() + "" + Math.floor(Math.random() * 1000000);
  return suffix ? id + suffix : id;
};

//创建节点数据
export const createVertexBPMNData = (
  type: VertexType,
  id: string,
  text: string
): VertexBPMNData => {
  switch (type) {
    case VertexType.START:
    case VertexType.BRANCH:
    case VertexType.END:
      return { type, id, name: text };
    case VertexType.NODE:
      return {
        type,
        id,
        name: text,
        canRevoke: 0,
        approvalMethod: 0,
        allowSigning: 0,
        call: 0,
      };
  }
};
//创建边数据
export const createEdgeBPMNData = (
  vId: string,
  jId: string,
  text: string,
  disable?: boolean
): EdgeBPMNData => {
  const id = createBPNMId("-E");
  return {
    id,
    priority: 1,
    sourceRef: vId,
    targetRef: jId,
    conditionName: text,
    nodeCondition: 1,
    disable,
  };
};

/**XML数据*/

//拓展字段前缀
export const XMLExtensionPrefix = "flowable:";
//XML属性前缀 区分节点的子节点和属性
export const XMLAttributePrefix = "@_";

//XML开始节点配置
export interface XMLStartExtension {
  //可发起部门
  "flowable:orgPromoters"?: string;
  //可发起人
  "flowable:userPromoters"?: string;
  //可发起职位类别
  "flowable:postPromoters"?: string;
  //抄送人
  "flowable:notifiers"?: string;
}

export interface XMLBase {
  "@_id": string;
  "@_name": string;
}

//XML开始节点
export interface XMLStart extends XMLBase {
  //说明
  documentation?: string;
}

//会签/或签信息 后端用
export interface MultiInstanceLoopCharacteristics {
  "@_isSequential": "false";
  "@_flowable:collection": string;
  "@_flowable:elementVariable": string;
  loopCardinality: string;
  completionCondition: string;
}
//获取会签/或签信息 后端用
const getMultiInstanceLoopCharacteristics = (
  bool: boolean
): MultiInstanceLoopCharacteristics => {
  return {
    "@_isSequential": "false",
    "@_flowable:collection": "flwUserList",
    "@_flowable:elementVariable": "approval",
    loopCardinality: "${loopCardinality}",
    completionCondition: bool
      ? "${nrOfCompletedInstances == 1}"
      : "${nrOfCompletedInstances/nrOfInstances >= 1}",
  };
};

export type BoolStr = "true" | "false";
//XML一般节点
export interface XMLNode extends XMLBase {
  //节点说明
  documentation?: string;
  "@_flowable:assignee": "${approval}";
  "@_flowable:dataType": string;
  //指定部门(负责人)
  "@_flowable:orgApprovalers"?: string;
  //指定审批人
  "@_flowable:userApprovalers"?: string;
  //指定职务
  "@_flowable:postApprovalers"?: string;
  //抄送人
  "@_flowable:notifiers"?: string;
  //能否撤回
  "@_flowable:canRevoke": BoolStr;
  //审批方式
  "@_flowable:approvalMethod": BoolStr;
  //允许加签
  "@_flowable:allowSigning": BoolStr;
  //是否回调
  "@_flowable:call": BoolStr;
  //回调地址
  "@_flowable:callAddress"?: string;
  //会签或签信息 后端用
  multiInstanceLoopCharacteristics?: MultiInstanceLoopCharacteristics;
  //数据权限
  "@_flowable:dataPermission"?: string;
}

//XML分支节点信息
export interface XMLBranch extends XMLBase {
  //说明
  documentation?: string;
}

//XML结束节点
export interface XMLEnd extends XMLBase {
  //说明
  documentation?: string;
}

interface EdgeExtension {
  //优先级
  "flowable:priority": string;
  //节点条件
  "flowable:nodeCondition": BoolStr;
}
interface ConditionExpression {
  "@_xsi:type": "tFormalExpression";
  //表达式
  "#text"?: string;
}
//XML边
export interface XMLEdge extends XMLBase {
  //起止节点id
  "@_sourceRef": string;
  "@_targetRef": string;
  //拓展
  extensionElements: EdgeExtension;
  conditionExpression?: ConditionExpression;
}

//XML流程数据
export interface XMLProcess extends XMLBase {
  "@_isExecutable": "true";
  //开始节点配置
  extensionElements: XMLStartExtension;
  //开始节点
  startEvent: XMLStart;
  //一般节点
  userTask: Array<XMLNode> | XMLNode;
  //分支节点
  exclusiveGateway: Array<XMLBranch> | XMLBranch;
  //结束节点
  endEvent: XMLEnd;
  //边
  sequenceFlow: Array<XMLEdge>;
}

export interface XMLBounds {
  "@_height": "0";
  "@_width": "0";
  //网格图x,y
  "@_x": string;
  "@_y": string;
}
//XML图形
export interface XMLPlane {
  "@_id": string;
  //图形对应的节点id
  "@_bpmnElement": string;
  //图形
  "omgdc:Bounds": XMLBounds;
}

//XML图数据 主要取顶点位置
export interface XMLPlanes {
  "@_id": string;
  //图对应的流程Process id
  "@_bpmnElement": string;
  //顶点
  "bpmndi:BPMNShape": Array<XMLPlane>;
}
//XML图形数据
export interface XMLDiagram {
  "@_id": string;
  //网格图配置
  "@_documentation": string;
  //图
  "bpmndi:BPMNPlane": XMLPlanes;
}

export interface XMLConfig {
  "@_encoding": "UTF-8";
  "@_version": "1.0";
}

const xmlConfigData: XMLConfig = { "@_version": "1.0", "@_encoding": "UTF-8" };
export interface XMLBaseData {
  "?xml": XMLConfig;
}
export interface XMLDefinitions {
  "@_exporter": string;
  "@_exporterVersion": string;
  "@_expressionLanguage": string;
  "@_targetNamespace": string;
  "@_typeLanguage": string;
  "@_xmlns": string;
  "@_xmlns:bpmndi": string;
  "@_xmlns:flowable": string;
  "@_xmlns:omgdc": string;
  "@_xmlns:omgdi": string;
  "@_xmlns:xsd": string;
  "@_xmlns:xsi": string;
  //流程数据
  process: XMLProcess;
  //图形数据
  "bpmndi:BPMNDiagram": XMLDiagram;
}
const defualtDefinitions = {
  "@_exporter": "Flowable Open Source Modeler",
  "@_exporterVersion": "6.7.2",
  "@_expressionLanguage": "http://www.w3.org/1999/XPath",
  "@_targetNamespace": "http://www.flowable.org/processdef",
  "@_typeLanguage": "http://www.w3.org/2001/XMLSchema",
  "@_xmlns": "http://www.omg.org/spec/BPMN/20100524/MODEL",
  "@_xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
  "@_xmlns:flowable": "http://flowable.org/bpmn",
  "@_xmlns:omgdc": "http://www.omg.org/spec/DD/20100524/DC",
  "@_xmlns:omgdi": "http://www.omg.org/spec/DD/20100524/DI",
  "@_xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
  "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
};
export interface XMLData extends XMLBaseData {
  definitions: XMLDefinitions;
}

/** 流程图转XML数据*/

//创建开始节点数据

//生成xml的机构字符串 也有父级id
//orgId1:[structureId1,structureId2,.....] , orgId2:[structureId1,structureId2,.....]
const createXMLOrgStr = (
  data?: Dictionary<Array<string>>
): string | undefined => {
  let str = "";
  if (data) {
    const oldKeys = Object.keys(data);
    oldKeys.forEach((key) => {
      if (!data[key] || !data[key].length) {
        delete data[key];
      }
    });
    const keys = Object.keys(data);
    keys.forEach((key, index) => {
      const arr = data[key];
      str += key + ":[" + arr.toString() + "]";
      if (index !== keys.length - 1) {
        str += ";";
      }
    });
  }
  return str ? str : undefined;
};
const createXMLStart = (start: BPMNStartData) => {
  const {
    id,
    name,
    documentation,
    orgPromoters,
    userPromoters,
    postPromoters,
    notifiers,
  } = start;
  const startEvent: XMLStart = { "@_id": id, "@_name": name, documentation };
  const orgStr = createXMLOrgStr(orgPromoters);
  const extensionElements: XMLStartExtension = {
    "flowable:orgPromoters": orgStr ? orgStr : "",
    "flowable:userPromoters": userPromoters ? userPromoters.join(",") : "",
    "flowable:postPromoters": postPromoters ? postPromoters?.join(",") : "",
    "flowable:notifiers": notifiers ? notifiers?.join(",") : "",
  };
  return { startEvent, extensionElements };
};

const getXmlNodeDataType = (
  orgApprovalers?: Dictionary<Array<string>>,
  userApprovalers?: Array<string>,
  postApprovalers?: Array<string>
): string => {
  const arr: Array<string> = [];
  if (orgApprovalers) {
    for (const key in orgApprovalers) {
      if (orgApprovalers[key].length > 0) {
        arr.push("1");
        break;
      }
    }
  }
  if (userApprovalers && userApprovalers.length) arr.push("2");
  if (postApprovalers && postApprovalers.length) arr.push("3");
  return arr.join(",");
};

//创建一般节点数据
const createXMLNode = (node: BPMNNodeData): XMLNode => {
  const {
    id,
    name,
    documentation,
    orgApprovalers,
    userApprovalers,
    postApprovalers,
    notifiers,
    canRevoke,
    approvalMethod,
    allowSigning,
    call,
    callAddress,
  } = node;
  const xmlNode: XMLNode = {
    "@_id": id,
    "@_name": name,
    documentation: documentation,
    "@_flowable:assignee": "${approval}",
    "@_flowable:dataType": getXmlNodeDataType(
      orgApprovalers,
      userApprovalers,
      postApprovalers
    ),
    "@_flowable:orgApprovalers": createXMLOrgStr(orgApprovalers),
    "@_flowable:userApprovalers": userApprovalers?.join(","),
    "@_flowable:postApprovalers": postApprovalers?.join(","),
    "@_flowable:notifiers": notifiers?.join(","),
    "@_flowable:canRevoke": canRevoke ? "true" : "false",
    "@_flowable:approvalMethod": approvalMethod ? "true" : "false",
    "@_flowable:allowSigning": allowSigning ? "true" : "false",
    "@_flowable:call": call ? "true" : "false",
    "@_flowable:callAddress": callAddress,
    multiInstanceLoopCharacteristics: getMultiInstanceLoopCharacteristics(
      approvalMethod ? true : false
    ),
  };
  return xmlNode;
};
//创建分支节点数据
const createXMLBranch = (branch: BPMNBranchData): XMLBranch => {
  const { id, name, documentation } = branch;
  const xmlBranch: XMLBranch = { "@_id": id, "@_name": name, documentation };
  return xmlBranch;
};
//创建结束节点
const createXmlEnd = (end: BPMNEndData): XMLEnd => {
  const { id, name, documentation } = end;
  const xmlEnd: XMLEnd = { "@_id": id, "@_name": name, documentation };
  return xmlEnd;
};
//创建边
const createXmlEdge = (edge: EdgeBPMNData): XMLEdge => {
  const {
    id,
    sourceRef,
    targetRef,
    conditionName,
    CDATA,
    nodeCondition,
    priority,
  } = edge;
  const xmlEdge: XMLEdge = {
    "@_id": id,
    "@_name": conditionName,
    "@_sourceRef": sourceRef,
    "@_targetRef": targetRef,
    extensionElements: {
      "flowable:priority": priority + "",
      "flowable:nodeCondition": nodeCondition ? "true" : "false",
    },
    conditionExpression: CDATA
      ? { "@_xsi:type": "tFormalExpression", "#text": `\<![CDATA[${CDATA}]]\>` }
      : undefined,
  };
  return xmlEdge;
};
//创建图形节点
const createXMLPlane = (
  vertexId: string,
  gridIndex: number,
  gridConfig: GridConfig
): XMLPlane | false => {
  const pt = getGridPt(gridIndex, gridConfig);
  const xmlPlane: XMLPlane = {
    "@_id": vertexId + "_plane",
    "@_bpmnElement": vertexId,
    "omgdc:Bounds": {
      "@_height": "0",
      "@_width": "0",
      "@_x": pt.x + "",
      "@_y": pt.y + "",
    },
  };
  return xmlPlane;
};

//根据流程图和网格配置,创建XML数据
export const createXMLData = (
  id: string,
  name: string | false,
  flowChart: FlowChart,
  gridConfig: GridConfig
): XMLData | false => {
  let startEvent: XMLStart | null = null;
  let extensionElements: XMLStartExtension | null = null;
  const userTask: Array<XMLNode> = [];
  const exclusiveGateway: Array<XMLBranch> = [];
  let endEvent: XMLEnd | null = null;
  const sequenceFlow: Array<XMLEdge> = [];
  const vertexNum = flowChart.getVertexNum();
  const planes: Array<XMLPlane> = [];
  for (let i = 0; i < vertexNum; i++) {
    const vertextData = flowChart.getVertexData(i);
    if (!vertextData || !vertextData.data) continue;
    switch (vertextData.type) {
      case VertexType.START:
        const startData = createXMLStart(vertextData.data as BPMNStartData);
        startEvent = startData.startEvent;
        extensionElements = startData.extensionElements;
        break;
      case VertexType.NODE:
        const node = createXMLNode(vertextData.data as BPMNNodeData);
        userTask.push(node);
        break;
      case VertexType.BRANCH:
        const branch = createXMLBranch(vertextData.data as BPMNBranchData);
        exclusiveGateway.push(branch);
        break;
      case VertexType.END:
        endEvent = createXmlEnd(vertextData.data as BPMNEndData);
    }
    //顶点的边
    for (let j = 0; j < vertexNum; j++) {
      const edge = flowChart.exists(i, j);
      if (!edge) continue;
      const xmlEdge = createXmlEdge(edge.data.data as EdgeBPMNData);
      sequenceFlow.push(xmlEdge);
    }
    //顶点图形信息
    const plane = createXMLPlane(
      vertextData.data.id as string,
      vertextData.gridIndex,
      gridConfig
    );
    if (!plane) continue;
    planes.push(plane);
  }
  if (
    !startEvent ||
    !extensionElements ||
    !endEvent ||
    !userTask.length ||
    !sequenceFlow.length
  )
    return false;
  const xmlProcess: XMLProcess = {
    "@_id": id,
    "@_name": name ? name : id,
    "@_isExecutable": "true",
    extensionElements,
    startEvent,
    userTask,
    exclusiveGateway,
    endEvent,
    sequenceFlow,
  };
  const xmlDiagram: XMLDiagram = {
    "@_id": createBPNMId(),
    "@_documentation": gridConfig.grid.join(","),
    "bpmndi:BPMNPlane": {
      "@_id": createBPNMId("-plane"),
      "@_bpmnElement": id,
      "bpmndi:BPMNShape": planes,
    },
  };
  const xmlConfig: XMLConfig = { ...xmlConfigData };
  const xmlData: XMLData = {
    "?xml": xmlConfig,
    definitions: {
      ...defualtDefinitions,
      process: xmlProcess,
      "bpmndi:BPMNDiagram": xmlDiagram,
    },
  };
  return xmlData;
};

/**XML数据插入流程图 */

const getGridIndex = (plane: XMLPlane, gridConfig: GridConfig) => {
  //不需要坐标
  const pt: Pt = { x: 0, y: 0 };
  const x = plane["omgdc:Bounds"]["@_x"];
  const y = plane["omgdc:Bounds"]["@_y"];
  const gridIndex = getGridIndexByGridPt({ x: +x, y: +y }, gridConfig);
  return { pt, gridIndex };
};

interface GetNodeData {
  pt: Pt;
  gridIndex: number;
  bpmnData: VertexBPMNData;
}

//获取XML的机构数据 也有父级id
//orgId1:[structureId1,structureId2,.....] , orgId2:[structureId1,structureId2,.....]
export const getOrgData = (
  data: string | undefined
): Dictionary<Array<string>> => {
  if (!data) return {};
  const arr = data.split(";");
  const map: Dictionary<Array<string>> = {};
  arr.forEach((item) => {
    const splitData = item.split(":");
    if (splitData.length === 2) {
      const orgArrStr = splitData[1];
      const orgArr: Array<string> = [];
      let idStr = "";
      for (let i = 0, l = orgArrStr.length; i < l; i++) {
        const char = orgArrStr[i];
        if (char === "[") continue;
        if (char === "," || char === "]") {
          orgArr.push(idStr);
          idStr = "";
        } else {
          idStr += char;
        }
      }
      map[splitData[0]] = orgArr;
    }
  });
  return map;
};
//根据XML开始节点数据,获取插入节点的数据
export const getStartData = (
  xmlStart: XMLStart,
  extension: XMLStartExtension,
  plane: XMLPlane,
  gridConfig: GridConfig
): GetNodeData => {
  const vertexType: VertexType = VertexType.START;
  const { pt, gridIndex } = getGridIndex(plane, gridConfig);
  const bpmnData: VertexBPMNData = {
    type: vertexType,
    id: xmlStart["@_id"],
    name: xmlStart["@_name"],
    documentation: xmlStart.documentation,
    orgPromoters: getOrgData(extension["flowable:orgPromoters"]),
    userPromoters: extension["flowable:userPromoters"]?.split(","),
    postPromoters: extension["flowable:postPromoters"]?.split(","),
    notifiers: extension["flowable:notifiers"]?.split(","),
  };
  return { pt, gridIndex, bpmnData };
};

//根据XML一般节点数据,获取插入节点的数据
export const getNodeData = (
  xmlNode: XMLNode,
  plane: XMLPlane,
  gridConfig: GridConfig
): GetNodeData => {
  const vertexType: VertexType = VertexType.NODE;
  const { pt, gridIndex } = getGridIndex(plane, gridConfig);
  const bpmnData: VertexBPMNData = {
    type: vertexType,
    id: xmlNode["@_id"],
    name: xmlNode["@_name"],
    documentation: xmlNode.documentation,
    orgApprovalers: getOrgData(xmlNode["@_flowable:orgApprovalers"]),
    userApprovalers: xmlNode["@_flowable:userApprovalers"]?.split(","),
    postApprovalers: xmlNode["@_flowable:postApprovalers"]?.split(","),
    canRevoke: xmlNode["@_flowable:canRevoke"] === "true" ? 1 : 0,
    approvalMethod: xmlNode["@_flowable:approvalMethod"] === "true" ? 1 : 0,
    allowSigning: xmlNode["@_flowable:allowSigning"] === "true" ? 1 : 0,
    call: xmlNode["@_flowable:call"] === "true" ? 1 : 0,
    callAddress: xmlNode["@_flowable:callAddress"],
    dataPermission: xmlNode["@_flowable:dataPermission"]?.split(","),
  };
  return { pt, gridIndex, bpmnData };
};

//根据XML分支节点,获取插入节点的数据
export const getBranchData = (
  xmlBranch: XMLBranch,
  plane: XMLPlane,
  gridConfig: GridConfig
): GetNodeData => {
  const vertexType: VertexType = VertexType.BRANCH;
  const { pt, gridIndex } = getGridIndex(plane, gridConfig);
  const bpmnData: VertexBPMNData = {
    type: vertexType,
    id: xmlBranch["@_id"],
    name: xmlBranch["@_name"],
    documentation: xmlBranch.documentation,
  };
  return { pt, gridIndex, bpmnData };
};

//根据XML结束节点，获取插入节点的数据
export const getEndData = (
  xmlEnd: XMLEnd,
  plane: XMLPlane,
  gridConfig: GridConfig
): GetNodeData => {
  const vertexType: VertexType = VertexType.END;
  const { pt, gridIndex } = getGridIndex(plane, gridConfig);
  const bpmnData: VertexBPMNData = {
    type: vertexType,
    id: xmlEnd["@_id"],
    name: xmlEnd["@_name"],
    documentation: xmlEnd.documentation,
  };
  return { pt, gridIndex, bpmnData };
};

interface GetEdgeData {
  i: number;
  j: number;
  bpmnData: EdgeBPMNData;
}

const ExpressionReg = /^<\!\[CDATA\[(\S+)\]\]\>$/;
const getConditionExpression = (str: string) => {
  return str.replace(ExpressionReg, "$1");
};
//根据XML边节点,获取插入边的数据
export const getEdgeData = (i: number, j: number, xmlEdge: XMLEdge) => {
  const bpmnData: EdgeBPMNData = {
    id: xmlEdge["@_id"],
    priority: +xmlEdge.extensionElements["flowable:priority"],
    nodeCondition:
      xmlEdge.extensionElements["flowable:nodeCondition"] === "true" ? 1 : 0,
    sourceRef: xmlEdge["@_sourceRef"],
    targetRef: xmlEdge["@_targetRef"],
    conditionName: xmlEdge["@_name"] ? xmlEdge["@_name"] : "设置条件",
    CDATA:
      xmlEdge.conditionExpression && xmlEdge.conditionExpression["#text"]
        ? getConditionExpression(xmlEdge.conditionExpression["#text"])
        : undefined,
  };
  return { i, j, bpmnData };
};
//根据XML数据 获取插入需要节点和边的数据
export const getNodeEdgeData = (xmlData: XMLData, gridConfig: GridConfig) => {
  const { process } = xmlData.definitions;
  const planes =
    xmlData.definitions["bpmndi:BPMNDiagram"]["bpmndi:BPMNPlane"][
      "bpmndi:BPMNShape"
    ];
  const planeMap: Dictionary<XMLPlane> = {};
  //节点id-下标索引
  const nodeMap: Dictionary<number> = {};
  planes.forEach((plane) => {
    planeMap[plane["@_bpmnElement"]] = plane;
  });
  const nodeArr: Array<GetNodeData> = [];
  const edgeArr: Array<GetEdgeData> = [];
  //开始节点
  const startData = getStartData(
    process.startEvent,
    process.extensionElements,
    planeMap[process.startEvent["@_id"]],
    gridConfig
  );
  nodeArr.push(startData);
  //一般节点
  const userTasks: Array<XMLNode> = Array.isArray(process.userTask)
    ? process.userTask
    : [process.userTask];
  userTasks.forEach((node) => {
    const nodeData = getNodeData(node, planeMap[node["@_id"]], gridConfig);
    nodeArr.push(nodeData);
  });
  //分支节点
  const exclusiveGateways: Array<XMLBranch> | undefined = Array.isArray(
    process.exclusiveGateway
  )
    ? process.exclusiveGateway
    : [process.exclusiveGateway];
  if (exclusiveGateways) {
    exclusiveGateways.forEach((branch) => {
      if (branch) {
        const branchData = getBranchData(
          branch,
          planeMap[branch["@_id"]],
          gridConfig
        );
        nodeArr.push(branchData);
      }
    });
  }
  //结束节点
  const endData = getEndData(
    process.endEvent,
    planeMap[process.endEvent["@_id"]],
    gridConfig
  );
  nodeArr.push(endData);
  nodeArr.forEach((node, index) => {
    nodeMap[node.bpmnData.id] = index;
  });
  //边
  process.sequenceFlow.forEach((edge) => {
    const i = nodeMap[edge["@_sourceRef"]];
    const j = nodeMap[edge["@_targetRef"]];
    const edgeData = getEdgeData(i, j, edge);
    edgeArr.push(edgeData);
  });
  return { nodeArr, edgeArr };
};

//验证数据
export const verificationData = (data: XMLData) => {
  const { process } = data.definitions;
  const { startEvent, endEvent, userTask, exclusiveGateway, sequenceFlow } =
    process;
  if (!startEvent["@_id"] || !startEvent["@_name"]) {
    // ElMessage.warning('开始节点名字不能为空')
    return false;
  }
  if (!endEvent["@_id"] || !endEvent["@_name"]) {
    // ElMessage.warning('结束节点名字不能为空')
    return false;
  }
  if (startEvent["@_name"].length > 50) {
    // ElMessage.warning('开始节点名字不能超过50个字符')
    return false;
  }
  if (endEvent["@_name"].length > 50) {
    // ElMessage.warning('结束节点名字不能超过50个字符')
    return false;
  }
  if (startEvent.documentation && startEvent.documentation.length > 200) {
    // ElMessage.warning('开始节点描述不能超过200个字符')
    return false;
  }
  if (endEvent.documentation && endEvent.documentation.length > 200) {
    // ElMessage.warning('结束节点描述不能超过200个字符')
    return false;
  }
  const taskArr = Array.isArray(userTask) ? userTask : [userTask];
  for (let i = 0, l = taskArr.length; i < l; i++) {
    const task = taskArr[i];
    if (!task["@_id"] || !task["@_name"]) {
      // ElMessage.warning('节点名字不能为空')
      return false;
    }
    // const taskName = task["@_name"];
    if (
      !task["@_flowable:canRevoke"] ||
      !task["@_flowable:allowSigning"] ||
      !task["@_flowable:approvalMethod"] ||
      !task["@_flowable:call"]
    )
      return false;
    if (task["@_name"].length > 50) {
      // ElMessage.warning(`节点${taskName}名字不能超过50个字符`)
      return false;
    }
    if (task.documentation && task.documentation.length > 200) {
      // ElMessage.warning(`节点${taskName}描述不能超过200个字符`)
      return false;
    }
    if (
      task["@_flowable:call"] === "true" &&
      (!task["@_flowable:callAddress"] ||
        task["@_flowable:callAddress"].length > 200)
    ) {
      // ElMessage.warning(`节点${taskName}回调地址未填或超过200个字符`)
      return false;
    }
  }
  if (exclusiveGateway) {
    const exclusiveGatewayArr = Array.isArray(exclusiveGateway)
      ? exclusiveGateway
      : [exclusiveGateway];
    for (let i = 0, l = exclusiveGatewayArr.length; i < l; i++) {
      const exclusiveGateway = exclusiveGatewayArr[i];
      if (!exclusiveGateway["@_id"] || !exclusiveGateway["@_name"]) {
        // ElMessage.warning("分支条件名字不能为空");
        return false;
      }
      // const exclusiveGatewayName = exclusiveGateway["@_name"];
      if (exclusiveGateway["@_name"].length > 50) {
        // ElMessage.warning(`分支${exclusiveGatewayName}名字不能超过50个字符`);
        return false;
      }
      if (
        exclusiveGateway.documentation &&
        exclusiveGateway.documentation.length > 200
      ) {
        // ElMessage.warning(`分支${exclusiveGatewayName}描述不能超过200个字符`);
        return false;
      }
    }
  }
  const sequenceFlowArr = Array.isArray(sequenceFlow)
    ? sequenceFlow
    : [sequenceFlow];
  //出边散列
  const sourceRefMap: Dictionary<Array<number | string>> = {};
  for (let i = 0, l = sequenceFlowArr.length; i < l; i++) {
    const sequenceFlow = sequenceFlowArr[i];
    if (!sequenceFlow["@_id"] || !sequenceFlow["@_name"]) {
      // ElMessage.warning("边的名字不能为空");
      return false;
    }
    // const sequenceFlowName = sequenceFlow["@_name"];
    if (sequenceFlow["@_name"].length > 50) {
      // ElMessage.warning(`边${sequenceFlowName}名字不能超过50个字符`);
      return false;
    }
    if (!sequenceFlow.extensionElements["flowable:priority"]) {
      // ElMessage.warning(`边${sequenceFlowName}必须设置优先级`);
      return false;
    }
    if (!sequenceFlow.extensionElements["flowable:nodeCondition"]) return false;
    const priority = sequenceFlow.extensionElements["flowable:priority"];
    const sourceRef = sequenceFlow["@_sourceRef"];
    if (!sourceRefMap[sourceRef]) sourceRefMap[sourceRef] = [];
    if (sourceRefMap[sourceRef].indexOf(priority) !== -1) {
      // ElMessage.warning(`边${sequenceFlowName}的优先级重复`);
      return false;
    }
    sourceRefMap[sourceRef].push(priority);
  }
  return true;
};
