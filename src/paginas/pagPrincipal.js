import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './pagina.css';

const PaginaPrincipal = () => {
  const [reclamacoes, setReclamacoes] = useState([]);
  const [reclamacoesFiltradas, setReclamacoesFiltradas] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroEmail, setFiltroEmail] = useState(false); 
  const [userName, setUserName] = useState(''); 
  const userEmail = localStorage.getItem('userEmail'); 

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/usuarios?email=${userEmail}`);
        if (response.data) {
          setUserName(response.data.name); 
        }
      } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
      }
    };

    fetchUserName(); 
  }, [userEmail]); 

  useEffect(() => {
    const fetchReclamacoes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/reclamacoes');
        setReclamacoes(response.data);
        setReclamacoesFiltradas(response.data);
      } catch (error) {
        console.error('Erro ao buscar reclamações:', error);
      }
    };

    fetchReclamacoes();
  }, []);

  const handlePesquisa = (event) => {
    const searchTerm = event.target.value;
    setTermoPesquisa(searchTerm);
    aplicarFiltros(searchTerm, filtroEmail);
  };

  const handleFiltroEmail = (event) => {
    const isChecked = event.target.checked;
    setFiltroEmail(isChecked);
    aplicarFiltros(termoPesquisa, isChecked);
  };

  const aplicarFiltros = (searchTerm, filtrarPorEmail) => {
    let filteredReclamacoes = reclamacoes;

    if (searchTerm) {
      filteredReclamacoes = filteredReclamacoes.filter(reclamacao =>
        reclamacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reclamacao.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtrarPorEmail) {
      filteredReclamacoes = filteredReclamacoes.filter(reclamacao =>
        reclamacao.email === userEmail
      );
    }

    setReclamacoesFiltradas(filteredReclamacoes);
  };

  return (
    <div className="pagina-principal">
      <h2>Bem-vindo {userName}!</h2> {/* Exibe o nome do usuário */}

      <Link to="/criar">
        <button>Criar Nova Reclamação</button>
      </Link>

      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Pesquisar reclamações..."
          value={termoPesquisa}
          onChange={handlePesquisa}
        />
      </div>

      <section className="lista-reclamacoes">
        <h2>Reclamações:</h2>
        <label className="filtro-email">
          <input
            type="checkbox"
            checked={filtroEmail}
            onChange={handleFiltroEmail}
          />
          Minhas reclamações
        </label>
        <ul>
          {reclamacoesFiltradas.map(reclamacao => (
            <li key={reclamacao._id}>
              <Link to={`/reclamacoes/${reclamacao._id}`} className="reclamacao-link">
                <div className="reclamacao-item">
                  <strong style={{ color: 'black' }}>{reclamacao.titulo}</strong> <br />
                  {/* Exibe o título da reclamação */}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PaginaPrincipal;
