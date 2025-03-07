import Pusher from 'pusher-js';
import React, { useEffect, useState } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  console.log('Bắt đầu khởi tạo Pusher');
  
  const pusher = new Pusher('nmjbskpj7nztubxsslio', {
    wsHost: 'pusher.cloodo.com',
    wsPort: 443,  // HTTPS dùng 443
    wssPort: 8080,
    forceTLS: true,
    encrypted: true,
    enabledTransports: ['wss'],
    disableStats: true,
    cluster: 'us2',
});


  console.log('Trạng thái kết nối hiện tại:', pusher.connection.state);

  pusher.connection.bind('connecting', () => {
    console.log('Đang kết nối đến Reverb...');
  });

  pusher.connection.bind('connected', () => {
    console.log('Đã kết nối thành công đến Reverb');
  });

  pusher.connection.bind('error', (err) => {
    console.error('Lỗi kết nối Reverb:', err);
  });

  pusher.connection.bind('failed', () => {
    console.error('Kết nối thất bại');
  });

  pusher.connection.bind('disconnected', () => {
    console.log('Đã ngắt kết nối từ Reverb');
  });

  useEffect(() => {
    // Subscribe vào channel
    const channel = pusher.subscribe('whatsapp-messages');
    
    // Lắng nghe event 'test-event'
    channel.bind('new-message', (data) => {
      console.log('Nhận được event:', data);
      setMessages(prev => [...prev, data]);
    });

    // Xử lý khi subscribe thành công
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Đã subscribe thành công vào channel whatsapp-messages');
    });

    // Xử lý khi có lỗi subscribe
    channel.bind('pusher:subscription_error', (error) => {
      console.error('Lỗi khi subscribe channel:', error);
    });

    return () => {
      console.log('Cleanup Pusher connection');
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h1>Trạng thái kết nối Reverb</h1>
      <p>Kiểm tra console để xem chi tiết</p>
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
