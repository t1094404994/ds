export type Dictionary<T> = { [key: string]: T };

//优先级类型
type PriorityType = ">" | "<" | "=" | " ";
//所有运算符
type Operator = "+" | "-" | "*" | "/" | "^" | "." | "(" | ")" | "$";
//二元计算运算符
type BinaryOpertor = "+" | "-" | "*" | "/" | "^" | ".";
// 一元计算运算符
// type UnaryOpertor=

//运算符优先级表 栈顶运算符比较当前运算符的优先级
const OperatorTable: Dictionary<Dictionary<PriorityType>> = {
  //                当前运算符
  //                 +        -        *        /        ^        (        )        .        $
  /*栈顶运算符*/ "+": {
    "+": ">",
    "-": ">",
    "*": "<",
    "/": "<",
    "^": "<",
    "(": "<",
    ")": ">",
    ".": ">",
    $: ">",
  },
  /*栈顶运算符*/ "-": {
    "+": ">",
    "-": ">",
    "*": "<",
    "/": "<",
    "^": "<",
    "(": "<",
    ")": ">",
    ".": ">",
    $: ">",
  },
  /*栈顶运算符*/ "*": {
    "+": ">",
    "-": ">",
    "*": ">",
    "/": ">",
    "^": "<",
    "(": "<",
    ")": ">",
    ".": ">",
    $: ">",
  },
  /*栈顶运算符*/ "/": {
    "+": ">",
    "-": ">",
    "*": ">",
    "/": ">",
    "^": "<",
    "(": "<",
    ")": ">",
    ".": ">",
    $: ">",
  },
  /*栈顶运算符*/ "^": {
    "+": ">",
    "-": ">",
    "*": ">",
    "/": ">",
    "^": ">",
    "(": "<",
    ")": ">",
    ".": ">",
    $: ">",
  },
  /*栈顶运算符*/ ".": {
    "+": ">",
    "-": ">",
    "*": ">",
    "/": ">",
    "^": ">",
    "(": "<",
    ")": ">",
    ".": ">",
    $: ">",
  },
  /*栈顶运算符*/ "(": {
    "+": "<",
    "-": "<",
    "*": "<",
    "/": "<",
    "^": "<",
    "(": "<",
    ")": "=",
    ".": "<",
    $: " ",
  },
  /*栈顶运算符*/ ")": {
    "+": " ",
    "-": " ",
    "*": " ",
    "/": " ",
    "^": " ",
    "(": " ",
    ")": " ",
    ".": ">",
    $: " ",
  },
  /*栈顶运算符*/ $: {
    "+": "<",
    "-": "<",
    "*": "<",
    "/": "<",
    "^": "<",
    "(": "<",
    ")": " ",
    ".": "<",
    $: "=",
  },
};

//读取字符串的数字
const numReader = (str: string, start: number): [number, number] | boolean => {
  if (!str[start]) {
    return false;
  }
  let next = start;
  let num = "";
  while (!isNaN(+str[next])) {
    num += str[next++];
  }
  if (start === next) return false;
  return [+num, next];
};

//计算二元运算符数据
const calculationBinary = (
  operator: BinaryOpertor,
  operNum1: number,
  operNum2: number
): number => {
  switch (operator) {
    case "+":
      return operNum1 + operNum2;
    case "-":
      return operNum1 - operNum2;
    case "*":
      return operNum1 * operNum2;
    case "/":
      return operNum1 / operNum2;
    case ".":
      return +(operNum1 + "." + operNum2);
    case "^":
      return Math.pow(operNum1, operNum2);
    default:
      return NaN;
  }
};

/**
 * 计算表达式
 * @param expression 表达式
 */
export const calculationExpression = (
  _expression: string | undefined
): number | undefined => {
  if (!_expression) return undefined;
  const expression = _expression + "$";
  //操作数栈
  const numStack: Array<number> = [];
  //操作符栈
  const operStack: Array<Operator> = [];
  //尾哨兵入栈
  operStack.push("$");
  //当前索引和当前字符串
  let nowIndex = 0;
  while (operStack.length) {
    const nowOper = expression[nowIndex] as Operator;
    //如果是数字
    if (!isNaN(+nowOper)) {
      const num = numReader(expression, nowIndex);
      if (Array.isArray(num)) {
        numStack.push(num[0]);
        nowIndex = num[1];
      } else {
        return undefined;
      }
    } else {
      //栈顶运算符
      const stackOper = operStack[operStack.length - 1] as Operator;
      //处理运算符优先级 判断栈顶运算符是否计算
      switch (OperatorTable[stackOper][nowOper]) {
        case "<":
          //栈顶运算符优先级更低 延迟处理
          operStack.push(nowOper);
          nowIndex++;
          break;
        case "=":
          //优先级相同 脱掉
          operStack.pop();
          nowIndex++;
          break;
        case ">":
          //栈顶运算符优先级更高 直接计算
          const oper = operStack.pop();
          //目前只有二元运算符
          const operNum2 = numStack.pop() as number;
          const operNum1 = numStack.pop() as number;
          const calcNum = calculationBinary(
            oper as BinaryOpertor,
            operNum1,
            operNum2
          );
          numStack.push(calcNum);
          break;
        case " ":
          //不应存在的情况
          return undefined;
        case undefined:
          //不支持的字符
          return undefined;
      }
    }
  }
  //如果还有操作数，说明表达式运算符不够，即错误的表达式
  if (numStack.length > 1) {
    return undefined;
  }
  return numStack.pop();
};

//读取字符串的值 公共方法
export const strNumReader = (
  str: string,
  startIndex?: number
): number | boolean => {
  const data = numReader(str, startIndex ? startIndex : 0);
  if (Array.isArray(data)) {
    return data[0];
  } else {
    return data;
  }
};

//检查指定位是否为1 maxbit 64
export const checkBit = (value: number, _bit: number) => {
  if (_bit < 0) return false;
  const bit = Math.floor(_bit);
  return value & (1 << bit) ? true : false;
};

//设置指定位是否为1 maxbit64
export const setBit = (value: number, _bit: number, bool: boolean) => {
  if (_bit < 0) return value;
  const bit = Math.floor(_bit);
  return bool ? value | (1 << bit) : value & ~(1 << bit);
};
