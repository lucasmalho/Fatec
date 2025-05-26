import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://spiffy-cascaron-7f16eb.netlify.app'
  ],
  methods: ['POST'],
  credentials: true
}));

app.use(express.json());

// Configure Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD
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

// New endpoint for sending confirmation emails
app.post('/api/send-confirmation', async (req, res) => {
  const { email, confirmationUrl } = req.body;

  try {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Confirme seu cadastro - ToxiFácil',
      html: `
        <h2>Bem-vindo ao ToxiFácil!</h2>
        <p>Para confirmar seu cadastro, clique no link abaixo:</p>
        <p><a href="${confirmationUrl}">Confirmar cadastro</a></p>
        <p>Se você não solicitou este cadastro, ignore este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    res.status(500).json({ error: 'Erro ao enviar email de confirmação' });
  }
});

// New endpoint for sending password reset emails
app.post('/api/send-password-reset', async (req, res) => {
  const { email, resetUrl } = req.body;

  try {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Recuperação de senha - ToxiFácil',
      html: `
        <h2>Recuperação de senha</h2>
        <p>Para redefinir sua senha, clique no link abaixo:</p>
        <p><a href="${resetUrl}">Redefinir senha</a></p>
        <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});