import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pagina-senha',
  templateUrl: './pagina-senha.page.html',
  styleUrls: ['./pagina-senha.page.scss'],
})
export class PaginaSenhaPage implements OnInit {
  emailOrCPF: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  async resetPassword() {
    try {
      await this.authService.resetPassword(this.emailOrCPF);
      console.log('Email de redefinição de senha enviado!');
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
    }
  }

}
