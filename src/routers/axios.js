import axios from 'axios';

export const fetchUsuarios = (setUsuarios) => {
  axios.get('http://localhost:5000/usuarios')
    .then(response => {
      setUsuarios(response.data);
    })
    .catch(error => {
      console.error('erro ao coletar dados', error);
    });
};
