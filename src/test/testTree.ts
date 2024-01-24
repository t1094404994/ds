// import BinSearchTree from "@/ds/binTree/BinSearchTree";
import BlackRedTree from "@/ds/binTree/BlackRedTree";
import Entry from "@/ds/entry/Entry";
//测试树
// function testTree() {
//   const tree = new BinSearchTree<string>();
//   console.time("treebuild");
//   for (let i = 0; i < 1000; i++) {
//     const key = Math.round(Math.random() * 1000);
//     tree.insert(new Entry(key, `0000${i}`));
//   }
//   console.timeEnd("treebuild");
//   const testArr: Array<string | number> = [];
//   tree.travIn((x) => {
//     testArr.push(x.data.key);
//   });
//   console.log(testArr);
//   console.time("treesearch");
//   let removeNum = 0;
//   for (let i = 0; i < 1000; i++) {
//     const flag = tree.remove(Math.round(Math.random() * 1000));
//     removeNum += flag ? 1 : 0;
//   }
//   console.warn("removeNum", removeNum);
//   testArr.length = 0;
//   tree.travIn((x) => {
//     testArr.push(x.data.key);
//   });
//   console.log(testArr);
//   console.timeEnd("treesearch");
//   const arr: Array<Entry<string>> = [];
//   console.time("arrbuild");
//   for (let i = 0; i < 1000; i++) {
//     const key = Math.round(Math.random() * 1000);
//     arr.push(new Entry(key, `0000${i}`));
//   }
//   console.timeEnd("arrbuild");
//   console.time("arrsearch");
//   for (let i = 0; i < 1000; i++) {
//     const key = Math.round(Math.random() * 1000);
//     arr.find((item) => item.key === key);
//   }
//   console.timeEnd("arrsearch");
// }
// testTree();

//测试红黑树
function testRBTree() {
  const tree = new BlackRedTree<string>();
  const testNum = 1000;
  console.time("treebuild");
  for (let i = 0; i < testNum; i++) {
    const key = Math.round(Math.random() * testNum);
    tree.insert(new Entry(key, `0000${i}`));
  }
  const testArr: Array<string | number> = [];
  tree.travIn((x) => {
    testArr.push(x.data.key);
  });
  console.log(testArr);
  console.timeEnd("treebuild");
  if (!tree.checkRBTree()) {
    console.log("插入后不满足红黑树性质");
  }
  console.time("treesearch");
  let removeNum = 0;
  for (let i = 0; i < testNum; i++) {
    const flag = tree.remove(Math.round(Math.random() * testNum));
    if (flag) removeNum++;
  }
  console.log("removeNum", removeNum);
  testArr.length = 0;
  tree.travIn((x) => {
    testArr.push(x.data.key);
  });
  console.log(testArr);
  console.timeEnd("treesearch");
  if (!tree.checkRBTree()) {
    console.log("移除后不满足红黑树性质");
  }
  const arr: Array<Entry<string>> = [];
  console.time("arrbuild");
  for (let i = 0; i < testNum; i++) {
    const key = Math.round(Math.random() * testNum);
    arr.push(new Entry(key, `0000${i}`));
  }
  console.timeEnd("arrbuild");
  console.time("arrsearch");
  for (let i = 0; i < testNum; i++) {
    const key = Math.round(Math.random() * testNum);
    arr.find((item) => item.key === key);
  }
  console.timeEnd("arrsearch");
}
testRBTree();
