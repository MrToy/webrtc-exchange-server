import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {createDataChannel} from './link'

function App() {
  //@ts-ignore
  useEffect(async ()=>{
    const dc = await createDataChannel("ws://127.0.0.1:8080","test")
    dc.onopen =()=>{
      console.log("open dc")
      dc.send("hello world")
      console.log(dc)
    }
    dc.onmessage=(e)=>{
      console.log("message",e.data)
    }
  },[])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
