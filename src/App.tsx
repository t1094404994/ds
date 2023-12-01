// import BinSearchTree from "./ds/binTree/BinSearchTree";
// import Entry from "./ds/entry/Entry";
//Calculation
import Calculation from "./views/Calculation";
import FlowChart from "./views/FlowChart";
import SVGCut from "./views/SVGCut";

//测试树
// function testTree() {
//   const tree = new BinSearchTree<string>();
//   console.time("treebuild");
//   for (let i = 0; i < 1000000; i++) {
//     const key = Math.round(Math.random() * 100000000);
//     tree.insert(new Entry(key, `0000${i}`));
//   }
//   console.timeEnd("treebuild");
//   console.time("treesearch");
//   for (let i = 0; i < 10000; i++) {
//     tree.search(Math.round(Math.random() * 100000000));
//   }
//   console.timeEnd("treesearch");
//   const arr: Array<Entry<string>> = [];
//   console.time("arrbuild");
//   for (let i = 0; i < 1000000; i++) {
//     const key = Math.round(Math.random() * 100000000);
//     arr.push(new Entry(key, `0000${i}`));
//   }
//   console.timeEnd("arrbuild");
//   console.time("arrsearch");
//   for (let i = 0; i < 10000; i++) {
//     const key = Math.round(Math.random() * 100000000);
//     arr.find((item) => item.key === key);
//   }
//   console.timeEnd("arrsearch");
// }

function App() {
  return (
    <>
      <Calculation />
      <FlowChart />
      <SVGCut />
    </>
  );
}

export default App;
