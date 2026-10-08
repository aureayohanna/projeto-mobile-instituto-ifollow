import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  emailOrCPF: string = '';
  password: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastController: ToastController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

  async ngOnInit() {
    this.authService['handleRedirectResult']();
    try {
      const result = await this.afAuth.getRedirectResult();
      if (result.user) {
        const user = result.user;
        const userRef = this.firestore.doc(`users/${user.uid}`);
        const docSnapshot = await userRef.get().toPromise();
        if (docSnapshot !== undefined && docSnapshot.exists) {
          await userRef.update({ profilePictureUrl: user.photoURL });
          this.router.navigate(['/tabs/tab1']);
        } else {
          const additionalUserInfo = {
            uid: user.uid,
            email: user.email,
            fullName: user.displayName,
            profilePictureUrl: user.photoURL,
          };
          await userRef.set(additionalUserInfo);
          this.router.navigate(['/tabs/tab1']);
        }
      }
    } catch (error) {
      console.error('Erro ao obter resultado de redirecionamento:', error);
      this.router.navigate(['/login']);
    }
  }

  async login() {
    try {
      await this.authService.signInWithEmailOrCPF(this.emailOrCPF, this.password);
      await this.presentToast('Login bem-sucedido! Redirecionando...');
      this.router.navigate(['/dog-animation']);
    } catch (error) {
      console.error('Erro no login:', error);
      await this.presentToast('Erro ao fazer login. Verifique seu email/CPF e senha e tente novamente.');
    }
  }

  googleLogin() {
    this.authService.googleLogin();
  }

  startWithoutLogin() {
    this.authService.startWithoutLogin();
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

  applyMask(event: any) {
    const value = event.target.value.trim();
    if (value.includes('@')) {
      this.emailOrCPF = value;
    } else if (/^\d/.test(value)) {
      this.emailOrCPF = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
  }
}
