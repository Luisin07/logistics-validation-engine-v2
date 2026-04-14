const express = require('express');
const cors = require('cors');

const validateRoute = require('./src/routes/validate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'UNDEFINED');

app.use('/api/validate', validateRoute);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});