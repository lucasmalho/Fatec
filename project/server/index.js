import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

// Configuração do CORS para permitir requisições do frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://spiffy-cascaron-7f16eb.netlify.app'
  ],
  methods: ['POST'],
  credentials: true
}));

app.use(express.json());

// Configurar o transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: process.env.EMAIL_RECIPIENT,
      subject: 'Nova mensagem de contato - ToxiFácil',
      html: `
        <h2>Nova mensagem de contato - ToxiFácil</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    res.status(500).json({ error: 'Erro ao processar sua mensagem' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});