import { useState } from "react";
import { calculationExpression } from "./util/math";

function App() {
  const [calculation, setCalculation] = useState("");
  const [result, setResult] = useState("");
  const onCalculation = () => {
    const resultNum = calculationExpression(calculation);
    if (resultNum === undefined) {
      setResult("表达式错误");
    } else {
      setResult(resultNum.toString());
    }
  };
  return (
    <>
      <input
        value={calculation}
        onChange={(e) => setCalculation(e.target.value)}
      />
      <button onClick={onCalculation}>计算</button>
      <span>值{result}</span>
    </>
  );
}

export default App;
