import React, {useEffect, useState} from 'react';
import Square from './Square';
import button from "bootstrap/js/src/button";
import {ArrowLeftOutlined} from "@ant-design/icons";


const calculateWinner = (squares) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    if (!squares.includes(null)) {
        return "Draw"
    }
    return null;
};

const Board = ({socket, room, user, setRoom, page, setPage}) => {
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    console.log(squares)
    const handleClick = (i) => {
        console.log(squares)
        const newSquares = [...squares];
        if (calculateWinner(squares) || newSquares[i]) {
            return;
        }
        if (me === 'O') {
            if (xIsNext) {
                return;
            } else {
                newSquares[i] = me;
            }
        }
        if (me === 'X') {
            if (xIsNext) {
                newSquares[i] = me;
            } else return;
        }
        // newSquares[i] = xIsNext ? 'X' : 'O';
        console.log("newSquares", newSquares)
        socket.emit('send_selected', {selected: newSquares, room: room, isXNext: !xIsNext})
        setSquares(newSquares);
        setXIsNext(!xIsNext);
    };

    const renderSquare = (i) => {
        return <Square value={squares[i]} onClick={() => handleClick(i)}/>;
    };

    const winner = calculateWinner(squares);
    const status = winner
        ? 'Winner: ' + winner
        : 'Next player: ' + (xIsNext ? 'X' : 'O');

    const [selected, setSelected] = useState(null)
    if (winner) {
        socket.emit("game_finished", {room: room, winner: winner, user: user.id})
    }

    const [me, setMe] = useState(null)
    const [usersInRoom, setUsersInRoom] = useState(0)
    const [dontFinishedGames, setDontFinishedGames] = useState([])

    const joinDonFinishedGame = (game) => {
        setPage(['waiting'])
        setRoom(game.roomId)
        socket.emit("join_dont_finished_game", {room: game, user: user?.id})
    }

    useEffect(() => {
        socket.on('receive_selected', (data) => {
            console.log("Received selected", data)
            setSquares(data.selected)
            setXIsNext(data.isXNext)
        })
        socket.on('user_joined', (data) => {
            console.log("User joined", data)
            // setMe(data)
        })
        socket.on('users_in_room', (data) => {
            console.log("Users in room", data)
            setUsersInRoom(data)
        })
        socket.on('room_full', (data) => {
            console.log("Room full", data)
        })
        socket.on('start_game', (data) => {
            console.log("Start game", data)
            setPage(['started'])
            setMe(data.youAre)
            socket.emit("create_user_room", {
                room: data.roomId,
                user: user?.id,
                isX: data.youAre === "X" ? true : false
            })
            setXIsNext(true)
        })

        socket.on("start_dont_finished_game", (data)=>{
            setMe(data.youAre)
            setPage(['started'])
        })

        socket.on('get_users_room', (data) => {
            console.log("Don't finished games", data)
            setDontFinishedGames(data)
        })

    }, [socket])

    useEffect(() => {
        socket.emit("get_users_room", {room: room, user: user?.id})
    }, [room])

    const leaveRoom = () => {
        socket.emit("leave_room", {room: room})
        setPage(['create-join'])
        setRoom(null)
        setSquares(Array(9).fill(null))
    }

    return (
        <div>
            {
                page.includes('create-join') ?
                dontFinishedGames.length > 0 ?
                    <div>
                        <h3 className="text-center mt-3 mb-3">Don't finished games</h3>
                        <div className="dont-finished-game-div">
                            {
                                dontFinishedGames.map((game, index) => (
                                    <div onClick={()=>joinDonFinishedGame(game)} className="dont-finished-game">
                                        <h6 >Room ID: {game.roomId}</h6>
                                    </div>
                                ))
                            }
                        </div>

                    </div>
                    : '':''
            }
            {
                page.includes('waiting') ?
                usersInRoom < 2 ?
                    <h3>Waiting for other player... <br />
                        {!page.includes('created') ?
                            <span>Room ID: <span style={{color:'#00A000'}}>{room}</span></span> : ''
                        }
                    </h3>
                    :''
                : ''
            }
            {
                    page.includes('started') ?
                <div>
                    <h3 className="text-center">Game is started</h3>
                    <h4 className="text-center">You are: {me}</h4>
                    <div className="status text-center">{status}</div>
                    <div className="board-row">
                        {renderSquare(0)}
                        {renderSquare(1)}
                        {renderSquare(2)}
                    </div>
                    <div className="board-row">
                        {renderSquare(3)}
                        {renderSquare(4)}
                        {renderSquare(5)}
                    </div>
                    <div className="board-row">
                        {renderSquare(6)}
                        {renderSquare(7)}
                        {renderSquare(8)}
                    </div>
                </div> : ''
            }
            {
                !page.includes('create-join') ?
                <div className="d-flex justify-content-center mt-4">
                    <button className="back" onClick={()=>leaveRoom()}>
                        <ArrowLeftOutlined style={{marginRight:'10px'}}/> Go back
                    </button>
                </div>:''
            }
        </div>
    );
};

export default Board;
