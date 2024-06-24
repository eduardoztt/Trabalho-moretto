import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [newUsuario, setNewUsuario] = useState({ name: '', email: '', senha: '', senhaConfirm: '', tipo: 'empresa' });
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUsuario(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newUsuario.senha !== newUsuario.senhaConfirm) {
      setPasswordError('Senhas são diferentes');
      return;
    }

    axios.post('http://localhost:5000/usuarios', { ...newUsuario, senhaConfirm: undefined })
      .then(() => {
        setNewUsuario({ name: '', email: '', senha: '', senhaConfirm: '', tipo: 'empresa' });
        setMessage('Registration successful!');
        setPasswordError('');
      })
      .catch(error => {
        if (error.response && error.response.data) {
          setMessage(error.response.data.error);
        } else {
          setMessage('Registration failed. Please try again.');
        }
      });

    // Força o redirecionamento após 1 segundo, independentemente do resultado da requisição
    setTimeout(() => {
      window.location.href = 'http://localhost:3000/';
    }, 1000);
  };

  return (
    <div className="main-page">
      <form onSubmit={handleSubmit} className="registration-form">
        <h1>Registrar-se</h1>
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={newUsuario.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={newUsuario.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={newUsuario.senha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmar Senha:</label>
          <input
            type="password"
            name="senhaConfirm"
            value={newUsuario.senhaConfirm}
            onChange={handleChange}
            required
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>
        <button type="submit" className="submit-btn">Registrar</button>
        {message && <p className={message.includes('successful') ? 'success-message' : 'error-message'}>{message}</p>}
      </form>
    </div>
  );
};

export default RegistrationForm;
