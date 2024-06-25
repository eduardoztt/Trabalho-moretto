import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onSuccess }) => {
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [message, setMessage] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.get(`http://localhost:5000/usuarios?email=${loginData.email}&senha=${loginData.senha}`)
      .then(response => {
        console.log('Response:', response);
        const userData = response.data;
        console.log('User Data:', userData);
        if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
          setMessage('Login concluído!');
          setIsLogged(true);
          localStorage.setItem('userEmail', loginData.email); 
          onSuccess();  
          setTimeout(() => {
            window.location.href = '/principal';
          }, 100);
        } else {
          setMessage('Falha no Login. Verifique suas credenciais.');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        setMessage('Falha no login. Por favor, tente novamente.');
      });
  };

  return (
    <div className="main-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Login</h1>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={loginData.senha}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Login</button>
        {message && <p className={message.includes('Login concluído!') ? 'success-message' : 'error-message'}>{message}</p>}
        <p><a href="/registro">Não tem uma conta ainda?</a></p>
      </form>
    </div>
  );
};

export default LoginForm;
