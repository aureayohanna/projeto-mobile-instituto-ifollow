import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab8',
  templateUrl: 'tab8.page.html',
  styleUrls: ['tab8.page.scss']
})
export class Tab8Page implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  user: any = {};
  bio: string = '';
  profilePictureUrl: string = '';
  adoptedAnimals: any[] = [];
  sponsoredAnimals: any[] = [];
  donations: any[] = [];
  fullName: string = '';
  username: string = '';
  email: string = '';
  isAnonymous: boolean = true;
  selectedAnimalId: string | null = null;

  profilePictureChange: BehaviorSubject<string> = new BehaviorSubject('');

  defaultProfilePictures: string[] = [
    'assets/imgs/icondoguinhorandom.svg',
    'assets/imgs/icondoguinhorandomazul.svg',
    'assets/imgs/icondoguinhorandomrosa.svg',
    'assets/imgs/icongatinhorandom.svg',
    'assets/imgs/icongatinhorandomazul.svg',
    'assets/imgs/icongatinhorandomrosa.svg'
  ];

  constructor(
    private navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  voltarParaPaginaAnterior() {
    this.navCtrl.back();
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.isAnonymous = user.isAnonymous;
        if (!this.isAnonymous) {
          const userRef = this.firestore.collection('users').doc(user.uid);
          userRef.valueChanges().subscribe((userData: any) => {
            this.user = userData || {};
            this.bio = this.user.bio || '';
            this.fullName = this.user.fullName || '';
            this.username = this.user.username || '';
            this.email = this.user.email || '';
            this.profilePictureUrl = this.user.profilePictureUrl || this.getRandomProfilePicture();
            this.setProfilePictureUrl(this.profilePictureUrl); // Salva a URL no localStorage
            this.profilePictureChange.next(this.profilePictureUrl);

            // Busca animais adotados
            if (userData && userData.adoptedAnimals) {
              this.fetchAdoptedAnimals(userData.adoptedAnimals);
            }

            // Busca animais apadrinhados
            if (userData && userData.sponsoredAnimals) {
              this.fetchSponsoredAnimals(userData.sponsoredAnimals);
            }

            // Busca doações feitas pelo usuário
            if (userData && userData.donations) {
              this.fetchDonations(userData.donations);
            }
          });
        }
      }
    });
  }

  fetchAdoptedAnimals(animalIds: string[]) {
    console.log('Animal IDs:', animalIds); 
    if (animalIds.length === 0) {
      this.adoptedAnimals = [];
      return;
    }
  
    const animalsCollection = this.firestore.collection('animals', ref => ref.where(firebase.firestore.FieldPath.documentId(), 'in', animalIds));
    animalsCollection.valueChanges().subscribe((animals: any[]) => {
      console.log('Adopted animals:', animals); 
      this.adoptedAnimals = animals;
    });
  }

  fetchUserDetails(userId: string) {
    this.firestore.collection('users').doc(userId).valueChanges().subscribe(userDetails => {
      const sponsoredAnimalIds = (userDetails as any)?.sponsoredAnimals || [];
      this.fetchSponsoredAnimals(sponsoredAnimalIds);
    });
  }

  fetchSponsoredAnimals(animalIds: string[]) {
    if (animalIds.length === 0) {
      this.sponsoredAnimals = [];
      return;
    }
  
    const animalsCollection = this.firestore.collection('animals', ref => ref.where(firebase.firestore.FieldPath.documentId(), 'in', animalIds));
    animalsCollection.valueChanges({ idField: 'id' }).subscribe((animals: any[]) => {
      this.sponsoredAnimals = animals;
    });
  }

  fetchDonations(donationIds: string[]) {
    console.log('Donation IDs:', donationIds); // Verifique os IDs das doações
    if (donationIds.length === 0) {
      this.donations = [];
      return;
    }
  
    const donationsCollection = this.firestore.collection('donation', ref => ref.where(firebase.firestore.FieldPath.documentId(), 'in', donationIds));
    donationsCollection.valueChanges().subscribe((donations: any[]) => {
      console.log('Donations:', donations); // Verifique os dados das doações
      this.donations = donations.map(donation => ({
        id: donation.id,
        ...donation
      }));
    });
  }

  getRandomProfilePicture(): string {
    const randomIndex = Math.floor(Math.random() * this.defaultProfilePictures.length);
    return this.defaultProfilePictures[randomIndex];
  }

  updateName() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).update({
          fullName: this.fullName
        }).then(() => {
          console.log('Name updated successfully');
        }).catch(error => {
          console.error('Error updating name:', error);
        });
      }
    });
  }

  updateUser() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        // Verificar se o novo username já está em uso
        this.firestore.collection('users', ref => ref.where('username', '==', this.username.toLowerCase()))
          .get()
          .subscribe(querySnapshot => {
            if (!querySnapshot.empty) {
              this.presentToast('Username já está em uso. Por favor, escolha outro.');
            } else {
              // Atualizar username se não estiver em uso
              this.firestore.collection('users').doc(user.uid).update({
                username: this.username
              }).then(() => {
                this.presentToast('Username atualizado com sucesso.');
              }).catch(error => {
                console.error('Erro ao atualizar username:', error);
              });
            }
          });
      }
    });
  }

  updateEmail() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        // Verificar se o novo email já está em uso
        this.firestore.collection('users', ref => ref.where('email', '==', this.email.toLowerCase()))
          .get()
          .subscribe(querySnapshot => {
            if (!querySnapshot.empty) {
              this.presentToast('Email já está em uso. Por favor, escolha outro.');
            } else {
              // Atualizar email se não estiver em uso
              user.updateEmail(this.email)
                .then(() => {
                  this.firestore.collection('users').doc(user.uid).update({
                    email: this.email
                  }).then(() => {
                    this.presentToast('Email atualizado com sucesso.');
                  }).catch(error => {
                    console.error('Erro ao atualizar email no banco de dados:', error);
                  });
                })
                .catch(error => {
                  console.error('Erro ao atualizar email:', error);
                });
            }
          });
      }
    });
  }

  updateBio() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).update({
          bio: this.bio
        }).then(() => {
          console.log('Bio updated successfully');
        }).catch(error => {
          console.error('Error updating bio:', error);
        });
      }
    });
  }

  uploadFile(event: any) {
    const file = event.target.files[0];
    const filePath = `profile_pictures/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          const timestampedUrl = `${url}?t=${new Date().getTime()}`;
          this.profilePictureUrl = timestampedUrl;
          this.setProfilePictureUrl(timestampedUrl); // Salve a URL no localStorage
          this.profilePictureChange.next(timestampedUrl);
          this.updateProfilePictureUrl(timestampedUrl);
        });
      })
    ).subscribe();
  }

  updateProfilePictureUrl(url: string) {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).update({
          profilePictureUrl: url
        }).then(() => {
          console.log('Profile picture URL updated successfully');
        }).catch(error => {
          console.error('Error updating profile picture URL:', error);
        });
      }
    });
  }

  setProfilePictureUrl(url: string) {
    localStorage.setItem('profilePictureUrl', url);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }

  isModalOpen = false;

  setOpen(isOpen: boolean, animalId?: string) {
    this.isModalOpen = isOpen;
    this.selectedAnimalId = isOpen ? animalId || null : null;
  }

  cancelSponsorship() {
    this.afAuth.currentUser.then(async (user) => {
      if (user && this.selectedAnimalId) {
        const animalId = this.selectedAnimalId;
        const userRef = this.firestore.collection('users').doc(user.uid);
        const animalRef = this.firestore.collection('animals').doc(animalId);
        try {
          await userRef.update({
            sponsoredAnimals: firebase.firestore.FieldValue.arrayRemove(animalId)
          });

          await animalRef.update({
            godfather: firebase.firestore.FieldValue.delete(),
            sponsored: false
          });

          this.sponsoredAnimals = this.sponsoredAnimals.filter(animal => animal.id !== animalId);

          this.presentToast('Apadrinhamento cancelado com sucesso');
          
          window.location.reload();
        } catch (error) {
          console.error('Erro ao cancelar apadrinhamento:', error);
        } finally {
          this.setOpen(false);
        }
      }
    });
  }
}
