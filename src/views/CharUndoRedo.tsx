import { useState } from "react";
import { FullCharUndoRedo } from "@/util/charUndoRedo/core";
const charUndoRedo = new FullCharUndoRedo("");

export default function CharUndoRedo() {
  const [text, setText] = useState("");
  const onAddOpertion = () => {
    charUndoRedo.addOpertion(text);
  };
  const onUndo = () => {
    const str = charUndoRedo.undo();
    setText(str);
  };
  const onRedo = () => {
    const str = charUndoRedo.redo();
    setText(str);
  };
  return (
    <>
      <div>CharUndoRedo</div>
      <button onClick={onAddOpertion}>修改文本</button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "500px", height: "200px" }}
      />
      <button onClick={onUndo}>Undo</button>
      <button onClick={onRedo}>Redo</button>
    </>
  );
}
