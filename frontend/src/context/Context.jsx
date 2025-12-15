import React, { createContext, children, useState } from 'react'
export const Counter = createContext();
function Context({children}) {
    const [val, setVal] = useState(12);
    const [data, setData] = useState(0);
        let store ={
        val, setVal, data, setData
    }
  return <Counter.Provider value = {store}>{children}</Counter.Provider>
}

export default Context