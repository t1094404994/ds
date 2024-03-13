interface TreeData<T> {
  children?: Array<T>;
}

/**
 * 树结构的遍历 更普适的方法
 * @param treeData 树数据
 * @param visit 访问函数
 */
export const traveTree = <T extends TreeData<T>>(
  treeData: Array<T>,
  visit: (node: T) => void
) => {
  if (!treeData.length) return;
  const stack: Array<T> = [];
  for (let i = 0, l = treeData.length; i < l; i++) {
    stack.push(treeData[i]);
  }
  let node: T | undefined = undefined;
  while ((node = stack.pop())) {
    visit(node);
    if (node.children && node.children.length) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        stack.push(node.children[i]);
      }
    }
  }
};

export const second = 1000;
export const minute = second * 60;
export const hour = minute * 60;
export const day = hour * 24;

//获取年月日 可拆分函数
export const getYearMonthDay = (time: number): Array<number> => {
  const timestr = new Date(time);
  const year = timestr.getFullYear();
  const month = timestr.getMonth() + 1;
  const day = timestr.getDate();
  return [year, month, day];
};
//获取年月日 字符串
export const getYearMonthDayStr = (time: number): string => {
  const timestr = new Date(time);
  const year = timestr.getFullYear();
  let month: string | number = timestr.getMonth() + 1;
  let day: string | number = timestr.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return year + "-" + month + "-" + day;
};

//获取时间字符串 格式 yyyy-mm-dd hh:mm:ss
export const getYMDHMSStr = (time: number): string => {
  const timeDate = new Date(time);
  const year = timeDate.getFullYear();
  let month: string | number = timeDate.getMonth() + 1;
  let day: string | number = timeDate.getDate();
  let hours: string | number = timeDate.getHours();
  let minutes: string | number = timeDate.getMinutes();
  let seconds: string | number = timeDate.getSeconds();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;
  return (
    year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds
  );
};

//获取年份
export const getYear = (time: number): number => {
  const timestr = new Date(time);
  const year = timestr.getFullYear();
  return year;
};

//获取一年的时间
export const getAYearStr = (time: number): Array<string> => {
  const timestr = new Date(time);
  const year = timestr.getFullYear();
  let month: string | number = timestr.getMonth() + 1;
  let day: string | number = timestr.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return [year - 1 + "-" + month + "-" + day, year + "-" + month + "-" + day];
};

const HeadMap: { [key: string]: Array<number> } = {
  xlsx: [0x50, 0x4b, 0x03, 0x04],
};
//文件头检测
export const fileHeadCheck = (file: File, fileType: string): Promise<null> => {
  return new Promise<null>((resolve, reject) => {
    const headData: Array<number> = HeadMap[fileType];
    if (headData && headData.length && headData.length <= file.size) {
      const fileHead = file.slice(0, headData.length);
      fileHead
        .arrayBuffer()
        .then((buffer) => {
          const dataView: DataView = new DataView(buffer);
          //防止文件头过长引起的数字溢出,这里一个字节一个字节的比较 也不需要考虑字节序
          for (let i = 0, l = headData.length; i < l; i++) {
            if (dataView.getUint8(i) !== headData[i]) {
              reject(null);
              return;
            }
          }
          resolve(null);
        })
        .catch(() => {
          reject(null);
        });
    } else {
      //
      reject(null);
    }
  });
};

//找到最小和最大的
export const findMinMax = (
  sourceArr: Array<number | string>
): Array<number | string> => {
  let min = sourceArr[0];
  let max = sourceArr[0];
  for (let i = 1, l = sourceArr.length; i < l; i++) {
    const now = sourceArr[i];
    if (now < min) min = now;
    if (now > max) max = now;
  }
  return [min, max];
};

//判断数字数组A和数字数组B是否有交集
export const checkCopyData = (
  arrA: Array<number | string>,
  arrB: Array<number | string>
): boolean => {
  for (let i = 0, la = arrA.length; i < la; i++) {
    const nowA = arrA[i];
    let flag = false;
    for (let k = 0, lb = arrB.length; k < lb; k++) {
      const nowB = arrB[k];
      if (nowB === nowA) {
        flag = true;
        break;
      }
    }
    if (flag) return true;
  }
  return false;
};

//交互数组数据
export function swapArrayData<T>(A: Array<T>, i: number, j: number) {
  const temp = A[i];
  A[i] = A[j];
  A[j] = temp;
}

//基于快速划分的k选取算法
export function quickSelect<T>(A: Array<T>, k: number) {
  for (let lo = 0, hi = A.length - 1; lo < hi; ) {
    let i = lo,
      j = hi;
    const pivot = A[lo];
    while (i < j) {
      //O(hi - lo + 1) = O(n)
      while (i < j && pivot <= A[j]) {
        j--;
        A[i] = A[j];
      }
      while (i < j && A[i] <= pivot) {
        i++;
        A[j] = A[i];
      }
    }
    A[i] = pivot;
    if (k <= i) hi = i - 1;
    if (i <= k) lo = i + 1;
  }
}
