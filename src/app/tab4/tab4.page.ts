import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

// Pipe para capitalizar a primeira letra de cada palavra
@Pipe({ name: 'capitalize' })
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page implements OnInit {
  animals: Observable<any[]> | undefined;
  animalsLength: number = 0; // Add this property
  selectedAnimal: any = {};
  selectedAnimalId: string | undefined;
  currentUser: any;
  estados: any;
  cidades: any;
  selecionadoEstado: any;
  selectedState: string | undefined;
  selectedCity: string | undefined;
  selectedSpecies: string | undefined;

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private toastController: ToastController 
  ) {}

  ngOnInit() {
    this.animals = this.firestore.collection('animals').valueChanges({ idField: 'id' });
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

    this.getEstados();
    this.getAnimals();
  }

  isModalOpen = false;

  isAuthenticatedUserWithEmail(): boolean {
    return this.currentUser && this.currentUser.email ? true : false;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  setOpen(isOpen: boolean, animalId?: string) {
    if (isOpen && !this.isAuthenticatedUserWithEmail()) {
      this.presentToast('Você precisa estar logado para apadrinhar um animal.');
      return;
    }

    this.isModalOpen = isOpen;
    if (animalId) {
      this.selectedAnimalId = animalId;
    }
  }

  isSecondModalOpen = false;

  setSecondModalOpen(isOpen: boolean, animalId?: string) {
    this.isSecondModalOpen = isOpen;
    if (animalId) {
      this.firestore.collection('animals').doc(animalId).valueChanges().subscribe(animal => {
        this.selectedAnimal = animal;
      });
    }
  }

  async sponsorAnimal() {
    if (this.selectedAnimalId && this.isAuthenticatedUserWithEmail()) {
      const animalRef = this.firestore.collection('animals').doc(this.selectedAnimalId);

      try {
        await animalRef.update({ sponsored: true });

        const user = await this.afAuth.currentUser;
        if (user) {
          const userRef = this.firestore.collection('users').doc(user.uid);
          await userRef.update({
            sponsoredAnimals: firebase.firestore.FieldValue.arrayUnion(this.selectedAnimalId)
          });
        }

        this.setOpen(false);

        // Aguardando a atualização antes de navegar
        setTimeout(() => {
          this.router.navigate(['/tabs/tab6']);
        }, 500); // Um atraso ligeiramente maior para garantir que a atualização seja propagada

      } catch (error) {
        console.error('Error sponsoring animal:', error);
      }
    } else {
      this.presentToast('Você precisa estar logado com um email para apadrinhar um animal.');
    }
  }

  getEstados() {
    this.http.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').subscribe((data: any) => {
      this.estados = data;
    });
  }

  getCidades(event: { detail: { value: any; }; }) {
    this.selecionadoEstado = event.detail.value;
    this.http.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${this.selecionadoEstado.id}/municipios`).subscribe((data: any) => {
      this.cidades = data;
    });
  }

  updateFilters(estado?: any, cidade?: any, species?: string) {
    const state = estado ? estado.sigla : undefined;
    const city = cidade ? cidade.nome : undefined;
    console.log(`Filtrando por: Estado: ${state}, Cidade: ${city}, Espécie: ${species}`);
    this.selectedState = state;
    this.selectedCity = city;
    this.selectedSpecies = species;
    this.getAnimals();
  }

  getAnimals() {
    this.animals = this.firestore.collection('animals', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      if (this.selectedState) {
        console.log(`Aplicando filtro de estado: ${this.selectedState}`);
        query = query.where('state', '==', this.selectedState);
      }
      if (this.selectedCity) {
        console.log(`Aplicando filtro de cidade: ${this.selectedCity}`);
        query = query.where('city', '==', this.selectedCity);
      }
      if (this.selectedSpecies) {
        console.log(`Aplicando filtro de espécie: ${this.selectedSpecies}`);
        query = query.where('species', '==', this.selectedSpecies);
      }
      return query;
    }).valueChanges({ idField: 'id' });

    this.animals.subscribe(filteredResults => {
      this.animalsLength = filteredResults.length; // Update the length
      console.log('Resultados filtrados:', filteredResults);
    });
  }
}
