import Calculation from "./views/Calculation";
import CharUndoRedo from "./views/CharUndoRedo";
import FlowChart from "./views/FlowChart";
import SVGCut from "./views/SVGCut";

function App() {
  return (
    <>
      <CharUndoRedo />
      <Calculation />
      <FlowChart />
      <SVGCut />
    </>
  );
}

export default App;
