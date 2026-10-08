import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import 'firebase/compat/firestore';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  isModalOpen = false;
  donations: any[] = [];
  selectedDonationId: string | undefined;
  currentUser: any;
  donationsLength: number = 0; // Variável para armazenar o comprimento das doações

  constructor(private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.firestore.collection('donation').snapshotChanges().subscribe(snapshot => {
      this.donations = snapshot.map(doc => ({
        id: doc.payload.doc.id,
        ...doc.payload.doc.data() as any
      }));
      
      // Atualiza o comprimento das doações
      this.donationsLength = this.donations.length;

      console.log('Donations:', this.donations);
      console.log('Donations length:', this.donationsLength); // Verifica o comprimento das doações
    });
    
    firebase.auth().onAuthStateChanged(user => {
      this.currentUser = user;
      console.log('Current user:', this.currentUser);
    });
  }

  setOpen(isOpen: boolean, donationId?: string) {
    this.isModalOpen = isOpen;
    if (isOpen && donationId) {
      this.selectedDonationId = donationId;
    }
    console.log('Modal state:', this.isModalOpen, 'Selected donation ID:', this.selectedDonationId);
  }

  async donate() {
    console.log("donate function called");
    if (this.selectedDonationId) {
      console.log('Selected donation ID:', this.selectedDonationId);
    } else {
      console.log('No donation ID selected');
    }

    if (this.currentUser) {
      console.log('Current user ID:', this.currentUser.uid);
    } else {
      console.log('No user is logged in');
    }

    if (this.selectedDonationId && this.currentUser) {
      const donationRef = this.firestore.collection('donation').doc(this.selectedDonationId);
      const userRef = this.firestore.collection('users').doc(this.currentUser.uid);

      try {
        // Registrar a doação no perfil do usuário
        await userRef.update({
          donations: firebase.firestore.FieldValue.arrayUnion(this.selectedDonationId)
        });
        console.log('Donation updated in user profile');

        this.setOpen(false);

        // Adiciona um pequeno delay para garantir que o modal se feche antes do redirecionamento
        setTimeout(() => {
          console.log('Navigating to tab7');
          this.router.navigate(['/tabs/tab7']); 
        }, 300);
      } catch (error) {
        console.error('Error updating donation:', error);
      }
    }
  }
}
