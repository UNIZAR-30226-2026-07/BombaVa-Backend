import express from 'express';
import dotenv from 'dotenv';
//Aqui se importa las turas que haremos en el futuro


dotenv.config();
const PORT = process.env.PORT || 3000;

//app.use es para decir que rutas y elemntos del backend se pueden usar
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor arrancado');
});

//Iniciar el Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});