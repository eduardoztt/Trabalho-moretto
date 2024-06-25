import React, { useState } from 'react';
import axios from 'axios';
import { useHistory, Link } from 'react-router-dom';
import './reclamacao.css';

const CriarReclamacao = () => {
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [showMessage, setShowMessage] = useState(false); 
  const history = useHistory();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userEmail = localStorage.getItem('userEmail');
      await axios.post('http://localhost:5000/reclamacoes', {
        titulo: novoTitulo,
        conteudo: novoConteudo,
        email: userEmail,
      });

      history.push('/principal');
    } catch (error) {
      console.error('Erro ao criar reclamação:', error);
    }

    setTimeout(() => {
      setNovoTitulo('');
      setNovoConteudo('');
      setShowMessage(true); 
      setTimeout(() => {
        setShowMessage(false); 
      }, 2000);
    }, 1000);
  };

  return (
    <div className="pagina-criar-reclamacao">
      <div className="container-formulario">
        <div className="topo-pagina">
          <Link to="/principal">Voltar</Link>
          <h1>Criar Nova Reclamação</h1>
        </div>
        <form onSubmit={handleSubmit} className="form-nova-reclamacao">
          <label>
            Título:
            <input
              type="text"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              required
            />
          </label>
          <label>
            Conteúdo:
            <textarea
              value={novoConteudo}
              onChange={(e) => setNovoConteudo(e.target.value)}
              required
            />
          </label>
          <button type="submit">Enviar Reclamação</button>
        </form>
        {showMessage && <p>Reclamação feita com sucesso!</p>}
      </div>
    </div>
  );
};

export default CriarReclamacao;
