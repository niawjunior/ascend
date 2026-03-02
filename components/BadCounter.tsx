import React, { useEffect, useState } from "react";

export default function BadCounter() {
  // Bad practice 1: `let` instead of `const` for things that don't need reassignment
  let title = "My Bad Counter Pro";
  let countStorage = 0;

  // Bad practice 2: any type
  const [data, setData] = useState<any>([]);

  // Bad practice 3: Direct mutation instead of setState (won't trigger re-render properly)
  let count = 0;

  // Bad practice 4: Missing dependency array, fetching in a non-async safe way
  useEffect(() => {
    // Bad practice 5: Using var
    var timestamp = Date.now();
    console.log("Component rendered at", timestamp);

    // Bad practice 6: Unnecessary setTimeout inside useEffect without cleanup
    setTimeout(() => {
      setData([{ id: 1, name: "test " + title }]);
    }, 1000);
  });

  // Bad practice 7: Using string refs (deprecated in React) or just weird DOM manipulation
  const increment = () => {
    count++; // Direct mutation! React won't know!
    countStorage = count;
    document.getElementById("bad-counter-display")!.innerHTML = "Count is: " + countStorage;
  };

  return (
    <div style={{ padding: "20px", border: "5px solid red", margin: "20px 0" }}>
      <h1 style={{ fontSize: "2rem" }}>{title}</h1>
      <h1 id="bad-counter-display" style={{ fontSize: "1.5rem" }}>
        Count is: {count}
      </h1>
      
      <button 
        onClick={increment}
        style={{ background: "red", color: "white", padding: "10px", marginTop: "10px" }}
      >
        Click me dummy
      </button>

      {/* Bad practice 8: using index as key in a map */}
      <ul>
        {data.map((item: any, i: number) => {
          return <li key={i}>{item.name}</li>
        })}
      </ul>
    </div>
  );
}
