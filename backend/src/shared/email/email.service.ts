import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

// Credenciais SMTP vêm do .env (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER,
// SMTP_PASS, SMTP_FROM). O transporter é criado na primeira utilização, para
// o app subir mesmo sem SMTP configurado (ex.: testes).
@Injectable()
export class EmailService {
  private transporter?: Transporter;

  async enviarCodigoRecuperacaoSenha(
    destinatario: string,
    nome: string,
    codigo: string,
    validadeMinutos: number,
  ): Promise<void> {
    await this.obterTransporter().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: destinatario,
      subject: 'Way Of The Weights — código para redefinir sua senha',
      text:
        `Olá, ${nome}!\n\n` +
        `Seu código para redefinir a senha é: ${codigo}\n` +
        `Ele vale por ${validadeMinutos} minutos.\n\n` +
        'Se você não pediu a redefinição, ignore este email: sua senha continua a mesma.',
      html:
        `<p>Olá, ${this.escaparHtml(nome)}!</p>` +
        `<p>Seu código para redefinir a senha é:</p>` +
        `<p style="font-size:28px;font-weight:bold;letter-spacing:6px">${codigo}</p>` +
        `<p>Ele vale por ${validadeMinutos} minutos.</p>` +
        '<p>Se você não pediu a redefinição, ignore este email: sua senha continua a mesma.</p>',
    });
  }

  private obterTransporter(): Transporter {
    this.transporter ??= createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      // true para a porta 465 (TLS direto); nas demais usa STARTTLS.
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return this.transporter;
  }

  // O nome é digitado pelo usuário: escapa para não injetar HTML no email.
  private escaparHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
