import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage {
  fullName: string = '';
  username: string = '';
  email: string = '';
  birthdate: string = '';
  cpf: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastController: ToastController
  ) {}

  async register() {
    if (this.password !== this.confirmPassword) {
      await this.presentToast('As senhas não coincidem!');
      return;
    }

    const isBirthdateValid = this.validateBirthdate(this.birthdate);
    if (!isBirthdateValid) {
      await this.presentToast('Data de nascimento inválida.');
      return;
    }

    const isCPFValid = this.authService.validateCPF(this.cpf);
    const isEmailExists = await this.authService.checkEmailExists(this.email);
    const isUsernameExists = await this.authService.checkUsernameExists(this.username);
    const isPhoneExists = await this.authService.checkPhoneExists(this.phone);

    if (!isCPFValid) {
      await this.presentToast('CPF inválido!');
      return;
    }

    if (isEmailExists) {
      await this.presentToast('Email já cadastrado. Por favor, use outro email.');
      return;
    }

    if (isUsernameExists) {
      await this.presentToast('Nome de usuário já cadastrado. Por favor, escolha outro.');
      return;
    }

    if (isPhoneExists) {
      await this.presentToast('Número de celular já cadastrado. Por favor, use outro número.');
      return;
    }

    const additionalData = {
      fullName: this.fullName,
      username: this.username,
      birthdate: this.birthdate,
      cpf: this.cpf,
      phone: this.phone,
      adoptedAnimals: [] 
    };
  
    try {
      await this.authService.signUp(this.email, this.password, additionalData);
      await this.presentToast('Cadastro realizado com sucesso! Redirecionando para a página de login...');
      this.router.navigate(['../login']);
    } catch (error) {
      await this.presentToast('Erro no cadastro. Por favor, tente novamente.');
    }
  }
  
  validateBirthdate(birthdate: string): boolean {
    const currentDate = new Date();
    const minDate = new Date('1900-01-01');
    const userBirthdate = new Date(birthdate);

    // Verifica se a data de nascimento é válida e maior que 1900
    if (userBirthdate < minDate || userBirthdate > currentDate) {
      return false;
    }

    // Calcula a idade
    const age = currentDate.getFullYear() - userBirthdate.getFullYear();
    const monthDifference = currentDate.getMonth() - userBirthdate.getMonth();
    const dayDifference = currentDate.getDate() - userBirthdate.getDate();

    // Ajusta a idade se o mês ou o dia não tiverem chegado ainda
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      return age - 1 >= 18;
    } else {
      return age >= 18;
    }
  }

  googleLogin() {
    this.authService.googleLogin();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  formatCPF(event: any) {
    let cpf = event.target.value.replace(/\D/g, ''); 
    cpf = cpf.substring(0, 11); 
    if (cpf.length > 3) {
      cpf = cpf.substring(0, 3) + '.' + cpf.substring(3);
    }
    if (cpf.length > 7) {
      cpf = cpf.substring(0, 7) + '.' + cpf.substring(7);
    }
    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11) + '-' + cpf.substring(11);
    }
    this.cpf = cpf;
  }
  
  formatPhone(event: any) {
    let phone = event.target.value.replace(/\D/g, ''); 
    phone = phone.substring(0, 11);
  
    if (phone.length > 2) {
      phone = '(' + phone.substring(0, 2) + ') ' + phone.substring(2);
    }
    if (phone.length > 6) {
      if (phone.length === 14) {
        phone = phone.substring(0, 10) + '-' + phone.substring(10);
      } else if (phone.length === 13) {
        phone = phone.substring(0, 9) + '-' + phone.substring(9);
      }
    }
    this.phone = phone;
  }
}
