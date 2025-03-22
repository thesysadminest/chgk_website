import React, { useState } from 'react';
import Grabber from '../components/Grabber';

const UserDetail = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const handleDataFetched = (data) => {
    setUser(data);
  };

  const handleError = () => {
    setError('Не удалось загрузить данные о пользователе');
  };

  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Данные пользователя</h1>
      <Grabber
        url={`http://127.0.0.1:8000/api/user/${userId}/`}
        onDataFetched={handleDataFetched}
      />
      {user ? (
        <div>
          <p>
            <strong>Имя пользователя:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Биография:</strong> {user.bio}
          </p>
        </div>
      ) : (
        <p>Данные о пользователе отсутствуют.</p>
      )}
    </div>
  );
};

export default UserDetail;