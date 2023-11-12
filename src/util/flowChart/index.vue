<!-- 审批流配置-->
<script setup lang="ts">
import mitt from '@/util/flowChart/mitt'
import {useRoute} from 'vue-router'
import {OrgTreeNode, getOrgTree, OrgTreeData} from '@/api/login'
import {ElMessage} from 'element-plus'
import {DataRes, Dictionary } from '@/api/config'
import {downBlobFile} from '@/util/common'
import {showMessageBox} from '@/util/element'
import {computed, onActivated, onBeforeUnmount, onDeactivated, ref, reactive, provide} from 'vue'
import {EdgeData, GridConfig, VertexData, VertexType} from '@/util/flowChart/graph'
import {FromVertexBPMNData, FromEdgeBPMNData, XMLData, getNodeEdgeData, XMLAttributePrefix, createBPNMId, verificationData} from '@/util/flowChart/bpmn'
import {downloadBPMNXML, uploadBPMNXML, GetDataPermission, NodePermission, saveNodePermission} from '@/api/approval/approvalProcessConfig'
import {parserXml, outXml} from '@/util/xml'
import FlowChartController from '@/util/flowChart/core'

import configData from './configData.vue'
import configNode from './configNode.vue'
import flowHead from './flowHead.vue'
import { AxiosPromise } from 'axios'

const inOpertion = ref(false)

const canvasBgRef = ref<HTMLCanvasElement>()
const canvasDyRef = ref<HTMLCanvasElement>()

let controller:FlowChartController|null = null
const init = () => {
  const backgroundCanvas = canvasBgRef.value
  const dynamicCanvas = canvasDyRef.value
  if (!backgroundCanvas || !dynamicCanvas) return
  const backgroundCtx = backgroundCanvas.getContext('2d')
  const dynamicCtx = dynamicCanvas.getContext('2d')
  if (!backgroundCtx || !dynamicCtx) return
  const gridConfig:GridConfig = {
    grid:[16, 10],
    rowHeight:200,
    rowGap:0,
    colWidth:200,
    colGap:0
  }
  if (controller) controller.dispose()
  controller = new FlowChartController({backgroundCanvas, backgroundCtx, dynamicCanvas, dynamicCtx}, gridConfig)
  controller.addEvents()
  inOpertion.value = controller.inOperation
}

const onUpdateOper = (bool:boolean) => {
  inOpertion.value = bool
}

const onDragEdgeEnd = () => {
  if (!controller) return
  controller.updateBgConfig()
  controller.drawBgCall()
}

//拖动类型
let dropVertexType:VertexType|null = null
const onAddDropVertex = (vertexType:VertexType) => {
  dropVertexType = vertexType
}
const onDragover = (evt:DragEvent) => {
  //阻止默认动作 停止冒泡
  evt.preventDefault()
  evt.stopPropagation()
}

//放入元素
const onDrop = (evt:DragEvent) => {
  //阻止默认动作 停止冒泡
  evt.preventDefault()
  evt.stopPropagation()
  if (!controller || dropVertexType === null) return
  const pt = {x:evt.offsetX, y:evt.offsetY}
  controller.insertVecter({pt, vertexType:dropVertexType})
  controller.updateBgConfig()
  controller.drawBgCall()
}


const edgeData = ref<EdgeData|null>(null)
const vertexData = ref<VertexData|null>(null)

const edgeFromData = ref<FromEdgeBPMNData|null>(null)
const vertexFromData = ref<FromVertexBPMNData|null>(null)
const flowInfor = ref<GetDataPermission>({flowManageId:'', procDefId:'', taskDefKey:''})
provide('flowInfor', flowInfor)
//本地保存的权限
const permissionMap = ref<Dictionary<Array<NodePermission>>>({})
provide('permissionMap', permissionMap)
//缓存数据权限
const onUpdatePermission = (data:Array<NodePermission>) => {
  const key = flowInfor.value.taskDefKey
  if (key) {
    permissionMap.value[key] = data
  }
}
//点击边
const onEdgeClick = () => {
  if (!controller) return
  const data = controller.getCurrentEdgeData()
  if (data && data.data) {
    edgeData.value = data
    edgeFromData.value = data.data
    vertexData.value = null
    vertexFromData.value = null
    flowInfor.value.taskDefKey = data.data.id as string
  }
}

//点击顶点
const onVertextClick = () => {
  if (!controller) return
  const data = controller.getCurrentVerterData()
  if (data) {
    vertexData.value = data
    vertexFromData.value = data.data
    edgeData.value = null
    edgeFromData.value = null
    flowInfor.value.taskDefKey = data.data.id as string
  }
}

//删除
const onDelete = () => {
  showMessageBox('确认删除当前选中节点或条件删除?').then(() => {
    if (!controller) return
    controller.removeCurrent()
    vertexData.value = null
    vertexFromData.value = null
    edgeData.value = null
    edgeFromData.value = null
    controller.updateBgConfig()
    controller.drawBgCall()
  }).catch(() => {
    //
  })
}

const addEvents = () => {
  if (controller) controller.addEvents()
  mitt.on('updateInOpertion', onUpdateOper)
  mitt.on('dragEdgeEnd', onDragEdgeEnd)
  mitt.on('edgeClick', onEdgeClick)
  mitt.on('vertextClick', onVertextClick)
}

const removeEvents = () => {
  if (controller) controller.removeEvents()
  mitt.off('updateInOpertion', onUpdateOper)
  mitt.off('dragEdgeEnd', onDragEdgeEnd)
  mitt.off('edgeClick', onEdgeClick)
  mitt.off('vertextClick', onVertextClick)
}

const showTreeLoading = ref(false)
//组织架构树的数据
const orgTreeMap = reactive<Dictionary<Array<OrgTreeNode>>>({})
const onUpdateTreeMap = (data:Dictionary<Array<OrgTreeNode>>) => {
  for (const key in data) {
    orgTreeMap[key] = data[key]
  }
}

const initTreeMap = (arr:Array<string>) => {
  if (arr.length) {
    showTreeLoading.value = true
    const promises:Array<OrgTreeData> = []
    arr.forEach((id) => {
      promises.push(getOrgTree(id, false))
    })
    Promise.all(promises).then((res) => {
      showTreeLoading.value = false
      arr.forEach((key, index) => {
        const data = res[index]
        orgTreeMap[key] = data.data.data
      })
    }).catch((error) => {
      console.warn(error)
      showTreeLoading.value = false
    })
  }
}

//流程id
const flowManageId = ref('')
const flowName = ref('')
const showDownloading = ref(false)
//解析xml数据
const parseXMLData = (buffer:string) => {
  const xmlData = parserXml<XMLData>(buffer, '@_', true)
  if (!xmlData || !controller) return
  //更新流程图流程id
  flowInfor.value.xmlProcDefId = xmlData.definitions.process['@_id']
  const {nodeArr, edgeArr} = getNodeEdgeData(xmlData, controller.getGridConfig())
  const noOrgArr:Dictionary<boolean> = {}
  controller.isShowMessage = false
  nodeArr.forEach((node) => {
    const {pt, gridIndex, bpmnData} = node
    if (controller) {
      controller.insertVecter({pt, vertexType:bpmnData.type}, gridIndex, bpmnData)
    }
    if (bpmnData.type === VertexType.START && bpmnData.orgPromoters) {
      for (const key in bpmnData.orgPromoters) {
        if (!orgTreeMap[key]) noOrgArr[key] = true
      }
    } else if (bpmnData.type === VertexType.NODE && bpmnData.orgApprovalers) {
      for (const key in bpmnData.orgApprovalers) {
        if (!orgTreeMap[key]) noOrgArr[key] = true
      }
    }
  })
  edgeArr.forEach((edge) => {
    const {i, j, bpmnData} = edge
    if (controller) {
      controller.insterEdge(i, j, bpmnData)
    }
  })
  controller.updateBgConfig()
  controller.drawBgCall()
  controller.isShowMessage = true
  initTreeMap(Object.keys(noOrgArr))
}
//更新流程图
const updateData = () => {
  const route = useRoute()
  if (route.query && route.query.id && route.query.name) {
    edgeData.value = null
    edgeFromData.value = null
    vertexData.value = null
    vertexFromData.value = null
    permissionMap.value = {}
    flowManageId.value = route.query.id + ''
    flowName.value = route.query.name + ''
    flowInfor.value.flowManageId = flowManageId.value
    showDownloading.value = true
    init()
    downloadBPMNXML(flowManageId.value).then((res) => {
      showDownloading.value = false
      if (res.data.code === 200 && res.data.data) {
        flowInfor.value.procDefId = res.data.msg
        parseXMLData(res.data.data)
      } else {
        flowInfor.value.procDefId = ''
        flowInfor.value.xmlProcDefId = ''
      }
    }).catch((error) => {
      console.warn(error)
      showDownloading.value = false
    })
  }
}

const showSaveLoading = ref(false)
//保存时流程图流程id
const updatePermissionMap = (newProcDefId:string, oldProcDefId?:string) => {
  const flowDataPermissions:Array<NodePermission> = []
  for (const key in permissionMap.value) {
    const arr = permissionMap.value[key]
    arr.forEach((item) => {
      item.procDefId = newProcDefId
      flowDataPermissions.push(item)
    })
  }
  return saveNodePermission({flowDataPermissions, oldProcDefId, newProcDefId})
}

//保存流程图
const saveXmlData = () => {
  if (!controller) return
  if (!flowInfor.value.xmlProcDefId) flowInfor.value.xmlProcDefId = createBPNMId()
  const xmlData = controller.save(flowInfor.value.xmlProcDefId, flowName.value)
  if (!xmlData) {
    // ElMessage.error('转换数据失败')
    return
  }
  if (!verificationData(xmlData)) {
    return
  }
  const out = outXml(xmlData, XMLAttributePrefix, false)
  if (!out) {
    ElMessage.error('输出数据失败')
    return
  }
  const oldId = flowInfor.value.procDefId
  showSaveLoading.value = true
  uploadBPMNXML({xml:out, name:xmlData.definitions.process['@_id']}, {flowManageId:flowManageId.value, name:flowName.value}).then((res) => {
    showSaveLoading.value = false
    flowInfor.value.procDefId = res.data.msg
    //更新数据权限
    return updatePermissionMap(res.data.msg, oldId)
  }).then(() => {
    showSaveLoading.value = false
    permissionMap.value = {}
    ElMessage.success('保存成功')
  }).catch((error) => {
    console.warn(error)
    showSaveLoading.value = false
  })
}

const onDown = () => {
  if (!controller) return
  if (!flowInfor.value.xmlProcDefId) flowInfor.value.xmlProcDefId = createBPNMId()
  const xmlData = controller.save(flowInfor.value.xmlProcDefId, flowName.value)
  if (!xmlData) {
    // ElMessage.error('转换数据失败')
    return
  }
  if (!verificationData(xmlData)) {
    return
  }
  const out = outXml(xmlData, XMLAttributePrefix, false)
  if (!out) {
    ElMessage.error('输出xml失败')
    return
  }
  //测试TODO 需要删除
  const file = new Blob([out], {type:'XML'})
  downBlobFile('测试输出.bpnm20.xml', file)
}


const onUpdateVertex = (data:FromVertexBPMNData) => {
  if (!vertexData.value) return
  vertexData.value.data = data
  const newName = data.name
  if (newName !== undefined) {
    vertexData.value.text = newName
    vertexData.value.textConfig.text = newName
  }
}
const onUpdateEdge = (data:FromEdgeBPMNData) => {
  if (!edgeData.value) return
  edgeData.value.data = data
  const newName = data.conditionName
  if (newName !== undefined) {
    edgeData.value.text = newName
    if (edgeData.value.textConfig) edgeData.value.textConfig.text = newName
  }
}

const onUpdateText = () => {
  if (controller) {
    controller.updateBgConfig()
    controller.drawBgCall()
  }
}

onActivated(() => {
  updateData()
  addEvents()
})

onDeactivated(() => {
  removeEvents()
})

onBeforeUnmount(() => {
  if (controller !== null) {
    controller.dispose()
    controller = null
  }
})

//TODO 动态扩容机制
const canvasWidth = ref(2000)
const canvasHeight = ref(3600)

const canvasWidthPx = computed(() => {
  return canvasWidth.value + 'px'
})
const canvasHeightPx = computed(() => {
  return canvasHeight.value + 'px'
})
</script>
<template>
  <div v-loading="showSaveLoading||showDownloading||showTreeLoading" class="approval-config__wapper d-common-flex-full">
    <div class="approval-config-con d-common-flex-full">
      <config-node class="approval-config-node" @add-drop-vertex="onAddDropVertex" />
      <div class="approval-config-flow">
        <flow-head @save="saveXmlData" @delete="onDelete" @down="onDown" />
        <div class="approval-config-canvascon">
          <el-Scrollbar class="approval-config-canvasawpper" wrap-class="d-common-post-abs d-common-full">
            <div class="approval-config-canvas-bg" @dragover="onDragover($event)" @drop="onDrop">
              <canvas ref="canvasBgRef" class="d-common-post-abs" :width="canvasWidth" :height="canvasHeight">
                您的浏览器版本不支持Canvas,请尝试升级或更新浏览器
              </canvas>
              <canvas ref="canvasDyRef" class="d-common-post-abs" :class="{'approval-config-convastop':!inOpertion}" :width="canvasWidth" :height="canvasHeight" />
            </div>
          </el-Scrollbar>
        </div>
      </div>
      <config-data
        :edge-data="edgeFromData"
        :vertex-data="vertexFromData"
        :org-tree-map="orgTreeMap"
        @update-vertex="onUpdateVertex"
        @update-edge="onUpdateEdge"
        @update-vertex-text="onUpdateText"
        @update-edge-text="onUpdateText"
        @update-tree-map="onUpdateTreeMap"
        @update-permission="onUpdatePermission"
      />
    </div>
  </div>
</template>
<style scoped>
.approval-config__wapper{
  background-color: var(--d-color-grey-light-7);
  padding: var(--d-margin-level-2) var(--d-margin-level-2) var(--d-margin-level-3) var(--d-margin-level-2);
  --config-head-height:48px
}
.approval-config-con{
  background-color: var(--d-color-white);
  box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.1);
  border-radius: var(--d-border-radius-level-2);
  overflow: auto;
}
.approval-config-node{
  width: 150px;
  height: 100%;
}

.approval-config-flow{
  width: calc(100% - 150px - 290px);
  height: 100%;
  border-left: 1px solid var(--d-icon-color-divider);
  border-right: 1px solid var(--d-icon-color-divider);
}
.approval-config-canvascon{
  background-color: var(--d-color-grey-light-7);
  padding: 23px 20px 0px 20px;
  height: calc(100% - var(--config-head-height));
}
.approval-config-canvasawpper{
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--d-color-grey-light-7);
}
.approval-config-canvas-bg{
  background-color: var(--d-color-white);
  width: v-bind(canvasWidthPx);
  height: v-bind(canvasHeightPx);
}
.approval-config-convastop{
  pointer-events: none
}
</style>
