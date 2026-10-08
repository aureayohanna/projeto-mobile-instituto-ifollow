import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

interface UserData {
  estado: any;
  cidade: any;
  complemento: any;
  bairro: any;
  numero: any;
  rua: any;
  cep: any;
  gender: any;
  username?: string;
  adoptedAnimals?: string[];
  email: string;
  cpf: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  [x: string]: any;
  private isAnonymous: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async signUp(email: string, password: string, additionalData: any) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (result.user) {
        additionalData.email = email;
        additionalData.adoptedAnimals = [];
        await this.firestore.collection('users').doc(result.user.uid).set(additionalData);
      }
      return result;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const emailSnapshot = await this.firestore.collection('users', ref => ref.where('email', '==', email)).get().toPromise();
      return !!emailSnapshot && !emailSnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const usernameSnapshot = await this.firestore.collection('users', ref => ref.where('username', '==', username)).get().toPromise();
      return !!usernameSnapshot && !usernameSnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar nome de usuário:', error);
      return false;
    }
  }

  async checkPhoneExists(phone: string): Promise<boolean> {
    try {
      const phoneSnapshot = await this.firestore.collection('users', ref => ref.where('phone', '==', phone)).get().toPromise();
      return !!phoneSnapshot && !phoneSnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar número de celular:', error);
      return false;
    }
  }

  startWithoutLogin() {
    this.isAnonymous = true;
    this.afAuth.signInAnonymously()
      .then(() => {
        console.log('Login anônimo bem-sucedido');
        this.router.navigate(['/dog-animation']);
      })
      .catch(error => {
        console.error('Erro ao fazer login anônimo:', error);
      });
  }
  
  getIsAnonymous() {
    return this.isAnonymous;
  }

  async signInWithEmailOrCPF(emailOrCPF: string, password: string) {
    this.isAnonymous = false;
  
    try {
      const isCPF = this.validateCPF(emailOrCPF);
      if (isCPF) {
        const cpfSnapshot = await this.firestore.collection('users', ref => ref.where('cpf', '==', emailOrCPF)).get().toPromise();
        if (cpfSnapshot !== undefined && !cpfSnapshot.empty) {
          const userData: UserData = cpfSnapshot.docs[0].data() as UserData;
          return await this.afAuth.signInWithEmailAndPassword(userData.email, password);
        } else {
          throw new Error('CPF não encontrado.');
        }
      } else {
        return await this.afAuth.signInWithEmailAndPassword(emailOrCPF, password);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) {
      return false; 
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit = remainder > 9 ? 0 : remainder;

    if (parseInt(cpf.charAt(9)) !== digit) {
      return false; 
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    digit = remainder > 9 ? 0 : remainder;

    if (parseInt(cpf.charAt(10)) !== digit) {
      return false;
    }

    return true;
  }

  async googleLogin() {
    this.isAnonymous = false;
    try {
      await this.afAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    } catch (error) {
      console.error('Erro no login com Google:', error);
      this.router.navigate(['/login']);
    }
  }

  async handleRedirectResult() {
    try {
      const result = await this.afAuth.getRedirectResult();
      const user = result.user;
  
      if (user) {
        const userRef = this.firestore.doc(`users/${user.uid}`);
        const docSnapshot = await userRef.get().toPromise();
        const additionalUserInfo = {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName,
          profilePictureUrl: user.photoURL,
        };
  
        if (docSnapshot !== undefined && docSnapshot.exists) {
          await userRef.update({ profilePictureUrl: user.photoURL });
        } else {
          await userRef.set(additionalUserInfo);
        }
  
        this.ngZone.run(() => {
          this.router.navigate(['/dog-animation']);
        });
      } else {
        console.error('Falha na autenticação: nenhum usuário retornado');
        this.ngZone.run(() => {
          this.router.navigate(['/login']);
        });
      }
    } catch (error) {
      console.error('Erro ao processar redirecionamento:', error);
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  async resetPassword(email: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      console.log('Email de redefinição de senha enviado!');
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      return await this.afAuth.signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    return this.afAuth.currentUser;
  }

  async getUserName(): Promise<string | null> {
    this.isAnonymous = false;
    const user = await this.afAuth.currentUser;
    if (!user) {
      console.log('Nenhum usuário conectado');
      return null;
    }

    const userDoc = await this.firestore.collection('users').doc<UserData>(user.uid).ref.get();
    if (!userDoc.exists) {
      console.log('Documento do usuário não existe');
      return null; 
    }

    console.log('Dados do documento do usuário:', userDoc.data());
    const userData = userDoc.data() as UserData;
    return userData.username || null;
  }  

  async isCurrentUserAnonymous(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return user ? user.isAnonymous : false;
  }

  async areUserDataComplete(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (user) {
      const userData = await this.firestore.collection('users').doc<UserData>(user.uid).ref.get();
      if (userData.exists) {
        const userDataObject = userData.data() as UserData;
        return !!userDataObject.gender && !!userDataObject.cep && !!userDataObject.rua && !!userDataObject.numero && !!userDataObject.bairro && !!userDataObject.complemento && !!userDataObject.cidade && !!userDataObject.estado;
      }
    }
    return false;
  }
}
