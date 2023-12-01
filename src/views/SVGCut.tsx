import { useEffect, useState } from "react";
import bgURL from "../assets/cut/bg.png";
import svgJsonData from "../assets/cut/mask.json";
export default function SVGCut() {
  const [svgCutArr, setSvgCutArr] = useState<Array<Array<string>>>([]);
  const onPathClick = (index: number) => {
    console.log(index);
  };
  const svgPathEls = svgCutArr.map((svgCut, index) => {
    const stroke = index > 50 ? "#0000ff" : undefined;
    return (
      <path
        key={index}
        stroke={stroke}
        d={svgCut.join(" ")}
        onClick={() => onPathClick(index)}
      />
    );
  });
  useEffect(() => {
    const arr: Array<Array<string>> = [];
    svgJsonData.forEach((item) => {
      arr.push(item.svg);
    });
    setSvgCutArr(arr);
  }, []);
  return (
    <>
      <div style={{ position: "relative" }}>
        <img src={bgURL} height={1024} />
        <div style={{ position: "absolute", left: "0", top: "0" }}>
          <svg
            width={575}
            height={1024}
            viewBox="0 0 575 1024"
            xmlns="http://www.w3.org/2000/svg"
            fill="#ffffff"
            strokeDasharray="5,5"
            stroke="#ff00ff"
            strokeWidth={2}
            opacity={0.5}
            style={{ position: "absolute" }}
          >
            {svgPathEls}
          </svg>
        </div>
      </div>
    </>
  );
}
