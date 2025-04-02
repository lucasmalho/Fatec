import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

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

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar a conexão com o servidor SMTP
transporter.verify(function(error, success) {
  if (error) {
    console.log('Erro na configuração do servidor SMTP:', error);
  } else {
    console.log('Servidor pronto para enviar emails');
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Validar os dados recebidos
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'tcc@malho.com.br',
      subject: 'Nova mensagem de contato - ToxiFácil',
      text: `
        Nome: ${name}
        Email: ${email}
        Telefone: ${phone}
        Mensagem: ${message}
      `,
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
    res.status(200).json({ message: 'Email enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ error: 'Erro ao enviar email: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});