import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './detalhe.css';

const ReclamacaoDetalhes = () => {
  const { id } = useParams();
  const [reclamacao, setReclamacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarioLoading, setComentarioLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const userEmail = localStorage.getItem('userEmail');

  const fetchReclamacao = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/reclamacoes/${id}`);
      setReclamacao(response.data);
    } catch (error) {
      setError(`Erro ao buscar reclamação com ID ${id}: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamacao();
  }, [id]);

  const handleSubmitComentario = async (event) => {
    event.preventDefault();
    setComentarioLoading(true);

    try {
      await axios.post(`http://localhost:5000/comentarios`, {
        texto: novoComentario,
        reclamacaoId: id,
        usuarioEmail: userEmail,
      });

      setNovoComentario('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setComentarioLoading(false);
    }
  };

  const handleDeleteComentario = async (comentarioId) => {
    try {
      await axios.delete(`http://localhost:5000/comentarios/${comentarioId}`);
      await fetchReclamacao(); 
    } catch (error) {
      console.error(`Erro ao deletar comentário com ID ${comentarioId}:`, error);
    }
  };

  const handleDeleteReclamacao = async () => {
    try {
      await axios.delete(`http://localhost:5000/reclamacoes/${id}`);
      window.location.href = '/principal'; 
    } catch (error) {
      console.error(`Erro ao deletar reclamação com ID ${id}:`, error);
    }
  };

  const handleUpdateReclamacao = async () => {
    try {
      await axios.put(`http://localhost:5000/reclamacoes/${id}`, {
        titulo: novoTitulo,
        conteudo: novoConteudo,
      });

      setEditando(false);
      window.location.reload();
    } catch (error) {
      console.error(`Erro ao atualizar reclamação com ID ${id}:`, error);
    }
  };

  const toggleEdit = () => {
    setEditando(!editando);
    if (reclamacao) {
      setNovoTitulo(reclamacao.titulo);
      setNovoConteudo(reclamacao.conteudo);
    }
  };

  if (loading) {
    return <div>Carregando reclamação...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="reclamacao-detalhes">
      <h1>Detalhes da Reclamação</h1>
      <div>
        {editando ? (
          <>
            <label>
              Novo Título:
              <input
                type="text"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Novo Conteúdo:
              <textarea
                value={novoConteudo}
                onChange={(e) => setNovoConteudo(e.target.value)}
                required
              />
            </label>
            <br />
          </>
        ) : (
          <>
            <strong>Usuário:</strong> {reclamacao.usuario ? reclamacao.usuario.name : 'Nome não disponível'} <br />
            <strong>Título:</strong> {reclamacao.titulo} <br />
            <strong>Conteúdo:</strong> {reclamacao.conteudo} <br />
          </>
        )}
      </div>
      {reclamacao.email === userEmail && (
        <div className="botoes-acoes">
          {editando ? (
            <button onClick={async () => {
              await handleUpdateReclamacao();
              window.location.reload(); 
            }}>Salvar</button>
          ) : (
            <>
              <button onClick={toggleEdit}>Editar Reclamação</button>
              <button className="botao-deletar" onClick={handleDeleteReclamacao}>Deletar Reclamação</button>
            </>
          )}
        </div>
      )}
      <form onSubmit={handleSubmitComentario}>
        <label>
          Novo Comentário:
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            required
          />
          <button type="submit" disabled={comentarioLoading} onClick={() => setTimeout(() => window.location.reload(), 1000)}>
            {comentarioLoading ? 'Adicionando...' : 'Adicionar Comentário'}
          </button>
        </label>
        <br />
      </form>
      <h2>Comentários:</h2>
      <ul className="comentarios-lista">
        {reclamacao.comentarios && reclamacao.comentarios.map((comentario, index) => (
          <li key={index} className="comentario-item">
            <div className="comentario-texto">{comentario.texto}</div>
            <div className="comentario-info">
              <span className="comentario-autor">Usuário: {comentario.usuario ? comentario.usuario.name : 'Anônimo'}</span>
              <span className="comentario-data">{formatarData(comentario.createdAt)}</span>
              {comentario.usuario && comentario.usuario.email === userEmail && (
                <button className="botao-deletar" onClick={() => handleDeleteComentario(comentario._id)}>Deletar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const formatarData = (dataStr) => {
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default ReclamacaoDetalhes;
