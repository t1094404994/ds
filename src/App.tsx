import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import BinSearchTree from "./ds/binTree/BinSearchTree";
import Entry from "./ds/entry/Entry";

//测试树
function testTree() {
  const tree = new BinSearchTree<string>();
  console.time("treebuild");
  for (let i = 0; i < 1000000; i++) {
    const key = Math.round(Math.random() * 100000000);
    tree.insert(new Entry(key, `0000${i}`));
  }
  console.timeEnd("treebuild");
  console.time("treesearch");
  for (let i = 0; i < 10000; i++) {
    tree.search(Math.round(Math.random() * 100000000));
  }
  console.timeEnd("treesearch");
  const arr: Array<Entry<string>> = [];
  console.time("arrbuild");
  for (let i = 0; i < 1000000; i++) {
    const key = Math.round(Math.random() * 100000000);
    arr.push(new Entry(key, `0000${i}`));
  }
  console.timeEnd("arrbuild");
  console.time("arrsearch");
  for (let i = 0; i < 10000; i++) {
    const key = Math.round(Math.random() * 100000000);
    arr.find((item) => item.key === key);
  }
  console.timeEnd("arrsearch");
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
