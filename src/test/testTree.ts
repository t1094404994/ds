import BlackRedTree from "@/ds/binTree/BlackRedTree";
import Entry from "@/ds/entry/Entry";
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
//测试红黑树
function testRBTree() {
  const tree = new BlackRedTree<string>();
  console.time("treebuild");
  for (let i = 0; i < 1000; i++) {
    const key = Math.round(Math.random() * 1000);
    tree.insert(new Entry(key, `0000${i}`));
  }
  const testArr: Array<string | number> = [];
  tree.travIn((x) => {
    testArr.push(x.data.key);
  });
  console.log(testArr);
  console.timeEnd("treebuild");
  console.time("treesearch");
  let removeNum = 0;
  for (let i = 0; i < 1000; i++) {
    const flag = tree.remove(Math.round(Math.random() * 1000));
    if (flag) removeNum++;
  }
  console.log("removeNum", removeNum);
  testArr.length = 0;
  tree.travIn((x) => {
    testArr.push(x.data.key);
  });
  console.log(testArr);
  console.timeEnd("treesearch");
  const arr: Array<Entry<string>> = [];
  console.time("arrbuild");
  for (let i = 0; i < 1000; i++) {
    const key = Math.round(Math.random() * 1000);
    arr.push(new Entry(key, `0000${i}`));
  }
  console.timeEnd("arrbuild");
  console.time("arrsearch");
  for (let i = 0; i < 1000; i++) {
    const key = Math.round(Math.random() * 1000);
    arr.find((item) => item.key === key);
  }
  console.timeEnd("arrsearch");
}
testRBTree();
