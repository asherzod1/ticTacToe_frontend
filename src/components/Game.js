import React, {useEffect, useState} from 'react';
import Board from './Board';
import {message} from "antd";
import {LogoutOutlined} from "@ant-design/icons";

const Game = ({socket}) => {
    const user = JSON.parse(localStorage.getItem('userTicTac'))
    const [myMessage, setMyMessage] = useState('')
    const [room, setRoom] = useState(0)
    const [messageRecieved, setMessageRecieved] = useState("")

    const [wantToJoin, setWantToJoin] = useState(false)

    const joinRoom = (roomId) => {
        socket.emit('join_room', {roomId, userId: user?.id})
        setRoom(roomId)
    }
    const sendMessage = () => {
        console.log("Sending message", myMessage)
        socket.emit('send_message', {message: myMessage, room: room})
    }

    const createRoom = () => {
        setPage(['created', 'waiting'])
        const newRoomId = Math.floor(Math.random() * 100000)
        setWantToJoin(false)
        socket.emit('create_room', newRoomId)
    }

    const [newRoom, setNewRoom] = useState(null)

    useEffect(() => {
        socket.on('receive_message', (data) => {
            console.log("Received message", data)
            setMessageRecieved(data.message)
        })
        socket.on('room_created', (data) => {
            console.log("Room created", data)
            if(data?.canCreate === true){
                setNewRoom(data?.roomId)
                joinRoom(String(data?.roomId))
            }
            else {
                message.error("Room already exists")
            }
            // setRoom(data.roomId)
        })
    }, [socket])

    const [page, setPage] = useState(['create-join'])

    const logOut = () => {
        localStorage.removeItem('userTicTac')
        window.location.reload()
    }

    return (
        <div className="game">
            <div>
                <div className="d-flex mb-3 justify-content-end">
                    <button onClick={()=>logOut()} className="btn btn-danger d-flex align-items-center"><LogoutOutlined style={{marginRight:"8px"}}/> LogOut</button>
                </div>
                {
                    page.includes('create-join') ?
                        <div className="create-and-join-page">
                            <div onClick={() => createRoom()} className="create-and-join-button">
                                Create a new room
                            </div>
                            <div onClick={()=> {
                                setWantToJoin(true)
                                setPage(['want-to-join'])
                            }} className="create-and-join-button">
                                Join a room
                            </div>
                        </div>
                        :''
                }
                {
                    newRoom && page.includes('created') ?
                        <div>
                            <h4 className="text-center mt-3">
                                Share this room id with your friend, Room ID: <span style={{color:'#00A000'}}>{newRoom}</span>
                            </h4>
                        </div> : ''
                }
                {
                    wantToJoin && page.includes('want-to-join')?
                        <div className="d-flex justify-content-center flex-wrap mt-3">
                            <label className="col-form-label" htmlFor="join-room-id"><h5>Enter room id you want to join:</h5></label>
                            <div className="d-flex w-100 justify-content-center">
                                <input
                                    style={{padding:'2px 8px'}}
                                    placeholder={"Enter room id"}
                                    id="join-room-id"
                                    onChange={(e) => setRoom(e.target.value)} type="text" className="form-text mx-3"/>
                                <button onClick={() => joinRoom(room)} className="btn btn-success">Join</button>
                            </div>
                        </div> :''
                }
                {/*<div className="d-flex justify-content-center mt-3">*/}
                {/*    <input*/}
                {/*        onChange={(e)=>setMessage(e.target.value)} type="text" className="form-text mx-3"/>*/}
                {/*    <button onClick={()=>sendMessage()}  className="btn btn-success">Send message</button>*/}
                {/*</div>*/}
                <div className="game-board mt-3">
                    <Board page={page} setPage={setPage} socket={socket} room={room} user={user} setRoom={setRoom}/>
                </div>
            </div>
        </div>
    );
};

export default Game;
