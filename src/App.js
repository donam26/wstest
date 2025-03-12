import Pusher from 'pusher-js';
import React, { useEffect, useState, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Chưa kết nối');
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  
  useEffect(() => {
    // Chỉ khởi tạo Pusher một lần
    if (!pusherRef.current) {
      console.log('Bắt đầu khởi tạo Pusher');
      
      // Enable Pusher logging
      Pusher.logToConsole = true;

      const pusherConfig = {
        wsHost: 'pusher.cloodo.com',
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        encrypted: false,
        enabledTransports: ['ws', 'wss'],
        cluster: 'ap1'
      };
      
      console.log('Cấu hình Pusher:', pusherConfig);
      
      pusherRef.current = new Pusher('nmjbskpj7nztubxsslio', pusherConfig);

      // Log trạng thái connection
      console.log('Initial connection state:', pusherRef.current.connection.state);
      
      pusherRef.current.connection.bind('connecting', () => {
        console.log('Đang kết nối đến Reverb...');
        setConnectionStatus('Đang kết nối...');
      });

      pusherRef.current.connection.bind('connected', () => {
        console.log('Đã kết nối thành công đến Reverb');
        console.log('Socket ID:', pusherRef.current.connection.socket_id);
        setConnectionStatus('Đã kết nối');
      });

      pusherRef.current.connection.bind('error', (err) => {
        console.error('Lỗi kết nối Reverb:', err);
        setConnectionStatus(`Lỗi: ${err.message}`);
      });

      pusherRef.current.connection.bind('failed', () => {
        console.error('Kết nối thất bại');
        setConnectionStatus('Kết nối thất bại');
      });

      pusherRef.current.connection.bind('disconnected', () => {
        console.log('Đã ngắt kết nối từ Reverb');
        setConnectionStatus('Đã ngắt kết nối');
      });

      // Subscribe channel
      channelRef.current = pusherRef.current.subscribe('whatsapp-messages');
      
      channelRef.current.bind('new-message', (data) => {
        console.log('Nhận được event:', data);
        setMessages(prev => [...prev, data]);
      });

      channelRef.current.bind('pusher:subscription_succeeded', () => {
        console.log('Đã subscribe thành công vào channel whatsapp-messages');
      });

      channelRef.current.bind('pusher:subscription_error', (error) => {
        console.error('Lỗi khi subscribe channel:', error);
        setConnectionStatus(`Lỗi subscribe: ${error.message}`);
      });
    }

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleanup Pusher connection');
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe('whatsapp-messages');
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []); // Empty dependency array

  return (
    <div className="App">
      <h1>Trạng thái kết nối Reverb</h1>
      <p>Protocol: {window.location.protocol}</p>
      <p>Trạng thái: {connectionStatus}</p>
      <p>State: {pusherRef.current?.connection.state}</p>
      <div>
        <h2>Danh sách tin nhắn nhận được:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{JSON.stringify(msg)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
