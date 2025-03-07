import Pusher from 'pusher-js';
import React, { useEffect, useState } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Chưa kết nối');
  
  console.log('Bắt đầu khởi tạo Pusher');

  // Enable Pusher logging
  Pusher.logToConsole = true;

  // Định nghĩa config trước
  const pusherConfig = {
    wsHost: 'pusher.cloodo.com',
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    encrypted: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: 'https://pusher.cloodo.com/reverb/auth',
    auth: {
      headers: {
        'X-CSRF-Token': 'SOME_CSRF_TOKEN'
      }
    },
    cluster: 'ap1'
  };
  
  console.log('Cấu hình Pusher:', pusherConfig);
  
  const pusher = new Pusher('nmjbskpj7nztubxsslio', pusherConfig);

  // Log trạng thái connection
  console.log('Initial connection state:', pusher.connection.state);
  
  // Log các event của connection
  pusher.connection.bind('connecting_in', (delay) => {
    console.log('Connecting in ' + delay);
  });

  pusher.connection.bind('connecting', () => {
    console.log('Đang kết nối đến Reverb...');
    setConnectionStatus('Đang kết nối...');
  });

  pusher.connection.bind('connected', () => {
    console.log('Đã kết nối thành công đến Reverb');
    console.log('Socket ID:', pusher.connection.socket_id);
    setConnectionStatus('Đã kết nối');
  });

  pusher.connection.bind('error', (err) => {
    console.error('Lỗi kết nối Reverb:', err);
    console.error('Error data:', {
      type: err.type,
      data: err.data,
      error: err.error,
      message: err.message
    });
    setConnectionStatus(`Lỗi: ${err.message}`);
  });

  pusher.connection.bind('failed', () => {
    console.error('Kết nối thất bại');
    console.error('Last error:', pusher.connection.lastError);
    setConnectionStatus('Kết nối thất bại');
  });

  pusher.connection.bind('disconnected', () => {
    console.log('Đã ngắt kết nối từ Reverb');
    setConnectionStatus('Đã ngắt kết nối');
  });

  useEffect(() => {
    try {
      console.log('Subscribing to channel whatsapp-messages');
      const channel = pusher.subscribe('whatsapp-messages');
      
      channel.bind('new-message', (data) => {
        console.log('Nhận được event:', data);
        setMessages(prev => [...prev, data]);
      });

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('Đã subscribe thành công vào channel whatsapp-messages');
      });

      channel.bind('pusher:subscription_error', (error) => {
        console.error('Lỗi khi subscribe channel:', error);
        setConnectionStatus(`Lỗi subscribe: ${error.message}`);
      });

      // Force kết nối
      console.log('Force connecting...');
      pusher.connect();

      return () => {
        console.log('Cleanup Pusher connection');
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  return (
    <div className="App">
      <h1>Trạng thái kết nối Reverb</h1>
      <p>Protocol: {window.location.protocol}</p>
      <p>Trạng thái: {connectionStatus}</p>
      <p>State: {pusher.connection.state}</p>
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
