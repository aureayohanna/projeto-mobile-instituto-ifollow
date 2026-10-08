import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  username: string | null = null;

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        const userDataComplete = await this.authService.areUserDataComplete();
        const isUserAnonymous = await this.authService.isCurrentUserAnonymous();

        if (!userDataComplete && !isUserAnonymous) {
          this.presentIncompleteDataToast();
        }

        if (!isUserAnonymous) {
          this.afAuth.currentUser.then(user => {
            if (user) {
              const userDoc = this.firestore.collection('users').doc(user.uid);
              userDoc.get().subscribe(doc => {
                if (doc.exists) {
                  const userData = doc.data() as any;
                  this.username = userData.username;
                } else {
                  this.router.navigate(['../cadastro']);
                }
              }, (error: any) => {
                console.error('Erro ao obter o documento do usuário:', error);
              });
            }
          }).catch((error: any) => {
            console.error('Erro ao obter o usuário atual:', error);
          });
        }
      }
    });
  }

  async presentIncompleteDataToast() {
    const toast = await this.toastController.create({
      message: 'Você ainda não preencheu todos os seus dados. Clique aqui!',
      duration: 5000, 
      position: 'top',
      buttons: [
        {
          text: 'Clique aqui',
          handler: () => {
            this.router.navigate(['/tabs/tab9']);
          }
        }
      ]
    });
    toast.present();
  }
}
