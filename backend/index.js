const express = require('express');
const cors = require('cors');

const validateRoute = require('./src/routes/validate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/validate', validateRoute);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});