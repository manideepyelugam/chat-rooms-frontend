
import { useEffect, useState } from "react";
import {io} from 'socket.io-client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCodeSVG } from 'qrcode.react';
const socket = io('https://chat-rooms-backed-1.onrender.com');


const App = () => {

       const [roomCode,setroomCode] = useState('');
       const [inRoom,setinRoom] = useState(false);
       const [username,setusername] = useState('');
       const [isUsername,setisUsername] = useState(false);
       const [chat,setchat] = useState([]);
       const [msg,setmsg] = useState('');

       const bottomRef = useRef(null);
       
  useEffect(() => {
    

     const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('roomCode');
    
    if (urlCode) {
        setroomCode(urlCode);
        joinRoom(urlCode);
    }
        


       socket.on('room-created',(roomCode) => {
            setinRoom(true)
            console.log(`room created ${roomCode}`);
            
       })


       socket.on("joined-room",(roomCode) => {
              setinRoom(true)
              console.log(`joined in room ${roomCode}`);
       })


       socket.on('recieve-message',({msg,username,id}) => {
            setchat((prev) => [...prev,{id,username,msg}])
            setmsg('')
       })


       socket.on('delete',(roomCode) => {
          alert("room is deleted");
          setchat('');
          setinRoom(false);
          setroomCode('');
       })

       socket.on("room-error",(msg) => {
           alert(msg)
       })

       return () => {
              socket.off('room-joined');
              socket.off('room-created');
              socket.off('room-error');
              socket.off('room-deleted');
              socket.off('receive-message');
            };
  },[])

useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
}, [chat]);
  
  const joinRoom = (roomCode) => {
    if(roomCode){
        socket.emit('join-room',roomCode)
    }
  }

  const handleRoomCreate = () => {
       if(roomCode.trim()){
           socket.emit('room-create',(roomCode));
       }
  }


  const handleRoomJoin = () => {
    if(roomCode.trim()){
        socket.emit('join-room',(roomCode))
    }
  }

  const handleMessage = () => {
      if(roomCode.trim() && username.trim()){
          socket.emit('send-message',({roomCode,msg,username}))
      }
  }

  const deleteRoom = () => {
      socket.emit('delete',(roomCode))
  }

  const joinUrl = `https://chat-rooms-simple.vercel.app?roomCode=${roomCode}`
  

  return (
    <div className="h-screen flex flex-col items-center justify-between py-14 px-4">
        <h1 className="text-black font-medium ">Chat-Rooms</h1>

    {!inRoom ? ( 
        <div>
              <div className="flex flex-col w-full max-w-sm items-center space-x-2">
                  <Input type="text" value={roomCode} onChange={(e) => setroomCode(e.target.value)} className={'mb-4'} placeholder="Room Code" />
                  <div>
                  <Button onClick={handleRoomCreate} className={'mr-2'} type="submit">Create Room</Button>
                  <Button onClick={handleRoomJoin} type="submit">Join Room</Button>
                  </div>
              </div>
        </div>): 
        (<div>
                {!isUsername ? (
                    <div>
                         <div className="flex w-full max-w-sm flex-col items-center space-x-2">
                                 <Input value={username} onChange={(e) => setusername(e.target.value)} type="email" placeholder="Enter Weird Name" />
                                <Button className={'mt-4'} onClick={() => setisUsername(true)} type="submit">Enter Room</Button>
                          </div>
                    </div>
                ) : 
                (
                    <div>

                        <div className="border rounded-lg  mb-4 p-2">
                                     <QRCodeSVG className="h-24 md:h-40" value={joinUrl} size={128} /> 
                        </div>


                <div className="border rounded-lg p-8 flex flex-col justify-between py-2 px-2 h-[500px] xl:w-[800px] lg:w-[600px] md:w-[500px]">
                    <div className="overflow-y-scroll
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 w-full flex flex-col h-[90%] relative ">
                    {chat.map((msg, index) => (
                        <div className={`flex ${(msg.id === socket.id) ? 'justify-end' : 'justify-start'}`}>
                                {/* {(msg.id === socket.id) ? 
                                (<div key={index} className="bg-[#18181a] px-3 py-2  w-auto rounded-md  text-white flex self-end">{msg.msg}</div>
) : (                                <div key={index} className="bg-[#f4f4f4]  px-3 py-2 rounded-md  w-auto flex self-start">{msg.msg}</div>
)} */}                           
                    {(msg.id === socket.id) ? (<h1 className="bg-[#18181a] mb-2 font-normal text-sm px-3 py-2 mr-2 rounded-md text-white ">{msg.msg}</h1>) : (<div className="bg-[#dbd9d99d] mb-2 text-sm font-normal px-3 py-2 rounded-md"><p className="text-[10px] mb-1 text-[#000000e3]  font-semibold ">{msg.username}</p>{msg.msg}</div>)}
                    
                        </div>
                     ))}
                        <div ref={bottomRef} ></div>


              </div>

                        <div className="flex w-full  items-center space-x-2">
   <Input
    className="w-full"
    value={msg}
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();  // Prevents default Enter key behavior (e.g., submitting forms)
            handleMessage();      // Calls the send message function
        }
    }}
    onChange={(e) => setmsg(e.target.value)}
    type="email"
    placeholder="your message here"
/>                                <Button  onClick={handleMessage} type="submit">Send</Button>
                          </div>

                </div>
                </div>)}
        </div>)}
       

        <p>Made with &#9829; by Manideep </p>
    </div>
  )
}



export default App;
