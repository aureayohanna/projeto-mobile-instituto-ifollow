import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  selectedTab: string = '';
  profilePictureUrl: string = '';
  defaultProfilePictures: string[] = [
    'assets/imgs/icondoguinhorandom.svg',
    'assets/imgs/icondoguinhorandomazul.svg',
    'assets/imgs/icondoguinhorandomrosa.svg',
    'assets/imgs/icongatinhorandom.svg',
    'assets/imgs/icongatinhorandomazul.svg',
    'assets/imgs/icongatinhorandomrosa.svg'
  ];

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private authService: AuthService,
    private navCtrl: NavController,
    private afAuth: AngularFireAuth
  ) {}

  voltarParaPaginaAnterior() {
    this.navCtrl.back();
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        if (user.isAnonymous) {
          this.profilePictureUrl = this.getRandomProfilePicture();
        } else {
          this.profilePictureUrl = localStorage.getItem('profilePictureUrl') || 'assets/imgs/default-profile-picture.svg';
        }
      } else {
        this.profilePictureUrl = 'assets/imgs/default-profile-picture.svg';
      }
    });

    this.router.events.subscribe((val) => {
      if (this.router.url.includes('/tab8')) {
        this.selectedTab = 'tab8';
      } else if (this.router.url.includes('/tab9')) {
        this.selectedTab = 'tab9';
      } else {
        this.selectedTab = 'outraTab';
      }
    });
  }

  getRandomProfilePicture(): string {
    const randomIndex = Math.floor(Math.random() * this.defaultProfilePictures.length);
    return this.defaultProfilePictures[randomIndex];
  }

  fecharMenu() {
    this.menuCtrl.close();
  }

  signOut() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']); 
    }).catch(error => {
      console.error('Erro ao fazer logout:', error);
    });
  }
}
