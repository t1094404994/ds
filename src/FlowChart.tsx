import { useState, useRef } from "react";
import { GridConfig, VertexType } from "./util/flowChart/graph";
import mitt from "./util/flowChart/mitt";
import FlowChartController from "./util/flowChart/core";

let controller: FlowChartController | null = null;

function App() {
  const [xPotion, setXPotion] = useState(0);
  const [yPotion, setYPotion] = useState(0);
  const [inOpertion, setInOpertion] = useState(false);

  const canvasBgRef = useRef<HTMLCanvasElement>(null);
  const canvasDyRef = useRef<HTMLCanvasElement>(null);
  //初始化
  const init = () => {
    const backgroundCanvas = canvasBgRef.current;
    const dynamicCanvas = canvasDyRef.current;
    if (!backgroundCanvas || !dynamicCanvas) return;
    const backgroundCtx = backgroundCanvas.getContext("2d");
    const dynamicCtx = dynamicCanvas.getContext("2d");
    if (!backgroundCtx || !dynamicCtx) return;
    const gridConfig: GridConfig = {
      grid: [16, 10],
      rowHeight: 200,
      rowGap: 0,
      colWidth: 200,
      colGap: 0,
    };
    if (controller) controller.dispose();
    controller = new FlowChartController(
      { backgroundCanvas, backgroundCtx, dynamicCanvas, dynamicCtx },
      gridConfig
    );
    controller.addEvents();
    setInOpertion(controller.inOperation);
  };
  //更新操作
  const onUpdateOper = (bool: boolean) => {
    setInOpertion(bool);
  };
  //拖动结束
  const onDragEdgeEnd = () => {
    if (!controller) return;
    controller.updateBgConfig();
    controller.drawBgCall();
  };

  //点击边
  const onEdgeClick = () => {
    if (!controller) return;
    const data = controller.getCurrentEdgeData();
    if (data && data.data) {
      //
    }
  };

  //点击顶点
  const onVertextClick = () => {
    if (!controller) return;
    const data = controller.getCurrentVerterData();
    if (data) {
      //
    }
  };

  //删除选中节点
  const onDelete = () => {
    if (!controller) return;
    controller.removeCurrent();
    controller.updateBgConfig();
    controller.drawBgCall();
  };

  //事件监听
  const addEvents = () => {
    if (controller) controller.addEvents();
    mitt.on("updateInOpertion", onUpdateOper);
    mitt.on("dragEdgeEnd", onDragEdgeEnd);
    mitt.on("edgeClick", onEdgeClick);
    mitt.on("vertextClick", onVertextClick);
  };

  const removeEvents = () => {
    if (controller) controller.removeEvents();
    mitt.off("updateInOpertion", onUpdateOper);
    mitt.off("dragEdgeEnd", onDragEdgeEnd);
    mitt.off("edgeClick", onEdgeClick);
    mitt.off("vertextClick", onVertextClick);
  };
  //新增节点
  const onAddNode = (vertexType: VertexType) => () => {
    if (!controller) {
      return;
    }
    mitt.emit("insertVertex", { vertexType, pt: { x: xPotion, y: yPotion } });
    controller.updateBgConfig();
    controller.drawBgCall();
  };
  const onRender = () => {
    init();
    addEvents();
  };
  return (
    <>
      <div>
        <span>x</span>
        <input value={xPotion} onChange={(e) => setXPotion(+e.target.value)} />
        <span>y</span>
        <input value={yPotion} onChange={(e) => setYPotion(+e.target.value)} />
        <button onClick={onAddNode(VertexType.START)}>新增开始节点</button>
        <button onClick={onAddNode(VertexType.END)}>新增结束节点</button>
        <button onClick={onAddNode(VertexType.NODE)}>新增中间节点</button>
        <button onClick={onAddNode(VertexType.BRANCH)}>新增分支节点</button>
        <div>canvas区域</div>
        <button onClick={onRender}>Render</button>
        <button onClick={onDelete}>删除节点</button>
        <button onClick={removeEvents}>清除事件</button>
        <div style={{ position: "relative" }}>
          <canvas ref={canvasBgRef} width={2000} height={3600}></canvas>
          <canvas
            ref={canvasDyRef}
            width={2000}
            height={3600}
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              pointerEvents: inOpertion ? "auto" : "none",
            }}
          ></canvas>
        </div>
      </div>
    </>
  );
}

export default App;
