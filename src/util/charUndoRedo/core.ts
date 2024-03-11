/**
 * 基于红黑树(持久化结构)的字符撤销重做
 */
import BlackRedTree from "@/ds/binTree/BlackRedTree";
import Entry from "@/ds/entry/Entry";

//char undo redo抽象数据类型
interface CharUndoRedoADT {
  //撤销
  undo(): void;
  //重做
  redo(): void;
  //获取当前字符串
  getStr(): string;
}
export class FullCharUndoRedo implements CharUndoRedoADT {
  private baseStr = "";
  private opertionStack: string[] = [];
  private currentIndex = -1;
  constructor(baseStr: string) {
    this.baseStr = baseStr;
  }
  addOpertion(str: string): void {
    const deleteNum = this.opertionStack.length - this.currentIndex - 1;
    if (deleteNum) {
      this.opertionStack.splice(this.currentIndex + 1, deleteNum);
    }
    this.opertionStack.push(str);
    this.currentIndex = this.opertionStack.length - 1;
  }
  undo(): string {
    this.currentIndex--;
    if (this.currentIndex < -1) this.currentIndex = -1;
    return this.getStr();
  }
  redo(): string {
    this.currentIndex++;
    if (this.currentIndex === this.opertionStack.length)
      this.currentIndex = this.opertionStack.length - 1;
    return this.getStr();
  }
  getStr(): string {
    if (this.currentIndex === -1) return this.baseStr;
    else return this.opertionStack[this.currentIndex];
  }
}

export class CharUndoRedo implements CharUndoRedoADT {
  private baseTree: BlackRedTree<string> = new BlackRedTree();
  private baseStr: string = "";
  constructor(baseStr: string) {
    this.baseStr = baseStr;
    this.initBaseTree();
  }
  undo(): void {
    // throw new Error("Method not implemented.");
  }
  redo(): void {
    // throw new Error("Method not implemented.");
  }
  getStr(): string {
    return "";
  }

  private initBaseTree() {
    for (let i = 0; i < this.baseStr.length; i++) {
      this.baseTree.insert(new Entry(i, this.baseStr[i]));
    }
  }
}
