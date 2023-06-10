import './App.css';
import io from 'socket.io-client'
import {useEffect, useState} from "react";
import Game from "./components/Game";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import PrivateRouter from "./pages/PrivateRouter";
import Login from "./pages/Login";
// const socket = io.connect('https://tictactoebackend-production.up.railway.app')
const socket = io.connect('http://localhost:8000')
function App() {


    useEffect(() => {
        socket.on('receive_message', (data) => {
            console.log("Received message", data)
        })
    },[socket])

  return (
    <div>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login socket={socket} />} />
                <Route element={<PrivateRouter socket={socket} />}>
                    <Route path="/" element={<Game socket={socket} />} />
                </Route>
            </Routes>
        </BrowserRouter>
        {/*<h3 className="text-center mt-3">User: {messageRecieved}</h3>*/}
        {/*<div className="App">*/}
        {/*    <Game socket={socket} room={room} />*/}
        {/*</div>*/}
    </div>

  );
}

export default App;
