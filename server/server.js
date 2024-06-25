const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let db;

// Conectar ao MongoDB
connectToDb((err) => {
  if (err) {
    console.error("Falha ao conectar ao banco de dados", err);
    process.exit(1);
  }
  db = getDb();
  console.log("Conectado ao MongoDB");

  // Iniciar o servidor
  app.listen(5000, () => {
    console.log('Servidor está rodando na porta 5000');
  });
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo quebrou!');
});

// Rotas para a coleção de usuários

// GET usuário por email e senha
app.get('/usuarios', (req, res) => {
  const { email, senha } = req.query;

  db.collection('usuario')
    .findOne({ email, senha }, )
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    })
    .catch(err => {
      console.error('Erro ao buscar usuário:', err);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    });
});

// POST um novo usuário
app.post('/usuarios', (req, res) => {
  const { name, email, senha, tipo } = req.body;

  db.collection('usuario')
    .findOne({ email })
    .then(user => {
      if (user) {
        res.status(400).json({ error: 'Email já existe' });
      } else {
        const newUsuario = {
          name,
          email,
          senha,
          tipo
        };

        db.collection('usuario')
          .insertOne(newUsuario)
          .then(result => {
            res.status(201).json(result.ops[0]);
          })
          .catch(err => {
            res.status(500).json({ error: 'usuário criado com sucesso' });
          });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Erro ao verificar emails existentes' });
    });
});

// DELETE um usuário
app.delete('/usuarios/:id', (req, res) => {
  const id = req.params.id;

  db.collection('usuario')
    .deleteOne({ _id: new ObjectId(id) })
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Nenhum usuário correspondente à consulta. Nenhum usuário deletado.' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Não foi possível deletar o usuário' });
    });
});

// Rotas para a coleção de reclamações

// GET todas as reclamações com informações do usuário
app.get('/reclamacoes', async (req, res) => {
  try {
    const reclamacoes = await db.collection('reclamacao')
      .aggregate([
        {
          $lookup: {
            from: 'usuario',
            localField: 'email',
            foreignField: 'email',
            as: 'usuario'
          }
        },
        {
          $unwind: {
            path: '$usuario',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            titulo: 1,
            conteudo: 1,
            email: 1,
            createdAt: 1,
            'usuario.name': 1,
            'usuario.email': 1  
          }
        }
      ])
      .toArray();

    res.status(200).json(reclamacoes);
  } catch (err) {
    console.error('Erro ao buscar reclamações:', err);
    res.status(500).json({ error: 'Erro ao buscar reclamações' });
  }
});

app.get('/reclamacoes/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const reclamacao = await db.collection('reclamacao').aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'usuario',
          localField: 'email',
          foreignField: 'email',
          as: 'usuario'
        }
      },
      {
        $unwind: {
          path: '$usuario',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          titulo: 1,
          conteudo: 1,
          email: 1,
          createdAt: 1,
          'usuario.name': 1,
          'usuario.email': 1
        }
      }
    ]).toArray();

    if (reclamacao.length === 0) {
      return res.status(404).json({ error: 'Reclamação não encontrada' });
    }

    const reclamacaoDetalhes = reclamacao[0];
    const comentarios = await db.collection('comentario')
      .aggregate([
        { $match: { reclamacaoId: id } },
        {
          $project: {
            _id: 1,
            texto: 1,
            usuario: 1,
            createdAt: 1
          }
        }
      ])
      .toArray();

    res.status(200).json({
      ...reclamacaoDetalhes,
      comentarios: comentarios
    });
  } catch (err) {
    console.error(`Erro ao buscar reclamação com ID ${id}:`, err);
    res.status(500).json({ error: 'Erro ao buscar reclamação' });
  }
});


// POST uma nova reclamação
app.post('/reclamacoes', (req, res) => {
  const { titulo, conteudo, email } = req.body;

  const newReclamacao = {
    titulo,
    conteudo,
    email,  
    createdAt: new Date(),
  };

  db.collection('reclamacao')
    .insertOne(newReclamacao)
    .then(result => {
      res.status(201).json(result.ops[0]);
    })
    .catch(err => {
      res.status(500).json({ error: 'Não foi possível criar uma nova reclamação' });
    });
});

// PUT atualizar uma reclamação por ID
app.put('/reclamacoes/:id', async (req, res) => {
  const id = req.params.id;
  const { titulo, conteudo } = req.body;

  try {
    const reclamacao = await db.collection('reclamacao')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { titulo, conteudo } },
        { returnOriginal: false }
      );

    if (!reclamacao.value) {
      return res.status(404).json({ error: 'Reclamação não encontrada' });
    }

    res.status(200).json(reclamacao.value);
  } catch (err) {
    console.error(`Erro ao atualizar reclamação com ID ${id}:`, err);
    res.status(500).json({ error: 'Erro ao atualizar reclamação' });
  }
});


// DELETE uma reclamação
app.delete('/reclamacoes/:id', (req, res) => {
  const id = req.params.id;

  db.collection('reclamacao')
    .deleteOne({ _id: new ObjectId(id) })
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Reclamação deletada com sucesso.' });
      } else {
        res.status(404).json({ message: 'Nenhuma reclamação correspondente à consulta. Nenhuma reclamação deletada.' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Não foi possível deletar a reclamação' });
    });
});

// Rotas para a coleção de comentários

// GET todos os comentários
app.get('/comentarios', (req, res) => {
  db.collection('comentario')
    .find()
    .toArray()
    .then(comentarios => {
      res.status(200).json(comentarios);
    })
    .catch(err => {
      console.error('Erro ao buscar comentários:', err);
      res.status(500).json({ error: 'Erro ao buscar comentários' });
    });
});

// POST um novo comentário
app.post('/comentarios', async (req, res) => {
  const { texto, reclamacaoId, usuarioEmail } = req.body;

  try {
    // Buscar o usuário pelo email associado à reclamação
    const usuario = await db.collection('usuario')
      .findOne({ email: usuarioEmail });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado para associar o comentário' });
    }

    const newComentario = {
      texto,
      reclamacaoId,
      usuario: {
        name: usuario.name,
        email: usuario.email
      },
      createdAt: new Date(),
    };

    // Inserir o novo comentário na coleção de comentários
    const result = await db.collection('comentario').insertOne(newComentario);

    res.status(201).json(result.ops[0]);
  } catch (err) {
    console.error('Erro ao criar um novo comentário:', err);
    res.status(500).json({ error: 'Não foi possível criar um novo comentário' });
  }
});

// PUT atualizar um comentário por ID
app.put('/comentarios/:id', (req, res) => {
  const id = req.params.id;
  const { texto } = req.body;

  db.collection('comentario')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { texto } },
      { returnOriginal: false }
    )
    .then(result => {
      if (!result.value) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      res.status(200).json(result.value);
    })
    .catch(err => {
      console.error(`Erro ao atualizar comentário com ID ${id}:`, err);
      res.status(500).json({ error: 'Erro ao atualizar comentário' });
    });
});




// DELETE um comentário
app.delete('/comentarios/:id', (req, res) => {
  const id = req.params.id;

  db.collection('comentario')
    .deleteOne({ _id: new ObjectId(id) })
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Comentário deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Nenhum comentário correspondente à consulta. Nenhum comentário deletado.' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Não foi possível deletar o comentário' });
    });
});

// Lidar com rotas não definidas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Manipulador de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

module.exports = app;
