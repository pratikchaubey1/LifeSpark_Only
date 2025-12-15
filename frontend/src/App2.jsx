import React, { useContext } from "react";
import { Counter } from "./context/Context";
import Cart3 from "./componenets/Cart3";

function App2() {
  const { val, setVal, data, setData } = useContext(Counter);

  function inc() {
    setVal((prev) => prev + 1);
  }

  function dec() {
    setVal((prev) => prev - 1);
  }

  function btn() {
    setVal((prev) => prev + data);
    setData(0);
  }

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6 items-center w-80">
      
          <div className="flex items-center gap-4">
            <button
              className="h-10 w-10 flex items-center justify-center bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
              onClick={inc}
            >
              +
            </button>

            <span className="text-xl font-semibold">{val}</span>

            <button
              className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
              onClick={dec}
            >
              -
            </button>
          </div>

          
          <div className="flex gap-3">
            <input
              type="number"
              onChange={(event) => setData(Number(event.target.value))}
              value={data}
              className="border border-gray-400 rounded-lg px-3 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={btn}
              className="px-4 py-1 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <Cart3 />
    </>
  );
}

export default App2;
