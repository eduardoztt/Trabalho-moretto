import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import RegistrationForm from './login_registro/RegistrationForm';
import './styles.css';
import LoginForm from './login_registro/LoginForm';
import PaginaPrincipal from './paginas/pagPrincipal';
import ReclamacaoDetalhes from './paginas/ReclamacaoDetalhes';
import CriarReclamacao from './paginas/CriarReclamacao';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [message, setMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    setAuthenticated(true);
  }, []);

  const fetchUsuarios = () => {
    axios.get('http://localhost:5000/usuarios')
      .then(response => {
        setUsuarios(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  };

  const handleRegistrationSuccess = (userData) => {
    if (Array.isArray(userData)) {
      userData.forEach(user => {
        // Handle each user data
      });
    } else if (userData && typeof userData === 'object') {
      // Handle single user object
      // If you need to convert a single object to an array, you can do:
      const userArray = [userData];
      userArray.forEach(user => {
        // Handle each user data
      });
    } else {
      console.error('Received invalid user data');
    }
  };

  return (
    <Router>
      <Switch>
        <Route path="/registro">
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        </Route>
        <Route exact path="/">
          <LoginForm onSuccess={handleRegistrationSuccess} />
        </Route>
        <Route path="/reclamacoes/:id">
          <ReclamacaoDetalhes />
        </Route>
        <Route path="/principal">
          <PaginaPrincipal/>
        </Route>
        <Route path="/criar">
        <CriarReclamacao />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
