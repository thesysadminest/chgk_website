import React from 'react';

function Registration() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch('/register/', {
      method: 'POST',
      body: formData,
    }).then(response => {
      if (response.ok) {
        alert('Registration successful!');
      } else {
        alert('Registration failed.');
      }
    });
  };
  return (
    <div className="container">
      <div className="form-box">
        <h1>Botanic Garden</h1>
        <p>chkg with us</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" placeholder="Eg: John-Doe-1" required />
          </label>
          <label>
            Email address:
            <input type="email" name="email" placeholder="Eg: jd123@yandex.com" required />
          </label>
          <label>
            Password:
            <input type="password" name="password" placeholder="at least 8 symbols" minLength="8" required />
          </label>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
export default Registration;