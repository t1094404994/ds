import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import BinSearchTree from "./ds/binTree/BinSearchTree";
import Entry from "./ds/entry/Entry";

//测试树
function testTree() {
  const tree = new BinSearchTree<string>();
  const removeList: Array<number> = [];
  const keyList: Array<number> = [];
  for (let i = 0; i < 300; i++) {
    const key = Math.round(Math.random() * 1000);
    tree.insert(new Entry(key, `0000${i}`));
    keyList.push(key);
    if (i & 1) {
      removeList.push(key);
    }
  }
  let size = 0;
  tree.travIn((e) => {
    size++;
    console.log(e.data.key);
  });
  console.log("size", size);
  console.log("treeSize", tree.size);
  console.log("移除", new Set(removeList));
  removeList.forEach((key) => {
    tree.remove(key);
  });
  size = 0;
  tree.travIn((e) => {
    size++;
    console.log("移除后", e.data.key);
  });
  console.log("size", size);
  console.log("treesize", tree.size);
}

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={testTree}>测试</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
