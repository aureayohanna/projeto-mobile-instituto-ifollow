import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab9',
  templateUrl: 'tab9.page.html',
  styleUrls: ['tab9.page.scss']
})
export class Tab9Page implements OnInit {
  user: any = {};
  gender: string = '';
  cep: string = '';
  rua: string = '';
  bairro: string = '';
  numero: string = '';
  complemento: string = '';
  cidade: string = '';
  estado: string = '';
  isAnonymous: boolean = true;

  constructor(
    private navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private toastController: ToastController,
    private http: HttpClient
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
            this.gender = this.user.gender || '';
            this.cep = this.formatCEPForDisplay(this.user.cep || '');
            this.rua = this.user.rua || '';
            this.bairro = this.user.bairro || '';
            this.numero = this.user.numero || '';
            this.complemento = this.user.complemento || '';
            this.cidade = this.user.cidade || '';
            this.estado = this.user.estado || '';
          });
        }
      }
    });
  }

  async updateGender(gender: string) {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await this.firestore.collection('users').doc(user.uid).update({ gender });
        this.presentToast('Gênero atualizado com sucesso');
      }
    } catch (error) {
      this.presentToast('Erro ao atualizar o gênero. Por favor, tente novamente.');
    }
  }

  async updatePhone() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const phoneExists = await this.checkPhoneExists(this.user.phone);
        if (phoneExists) {
          this.presentToast('Número de celular já cadastrado. Por favor, use outro número.');
        } else {
          await this.firestore.collection('users').doc(user.uid).update({ phone: this.user.phone });
          this.presentToast('Celular atualizado com sucesso');
        }
      }
    } catch (error) {
      this.presentToast('Erro ao atualizar o celular. Por favor, tente novamente.');
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

  async checkAndUpdateCPF() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const cpfExists = await this.checkCPFExists(this.user.cpf);
        if (cpfExists) {
          this.presentToast('CPF já cadastrado. Por favor, use um CPF diferente.');
        } else {
          await this.firestore.collection('users').doc(user.uid).update({ cpf: this.user.cpf });
          this.presentToast('CPF atualizado com sucesso');
        }
      }
    } catch (error) {
      this.presentToast('Erro ao atualizar o CPF. Por favor, tente novamente.');
    }
  }

  async checkCPFExists(cpf: string): Promise<boolean> {
    try {
      const cpfSnapshot = await this.firestore.collection('users', ref => ref.where('cpf', '==', cpf)).get().toPromise();
      return !!cpfSnapshot && !cpfSnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    }
  }

  handleDateInput(event: any) {
    const input = event.target;
    const value = input.value;
  
    // Divida a data nos componentes ano, mês e dia
    const dateParts = value.split('-');
    if (dateParts.length === 3) {
      let [year, month, day] = dateParts;
  
      // Limita o ano a 4 dígitos
      if (year.length > 4) {
        year = year.slice(0, 4);
        input.value = `${year}-${month}-${day}`;
      }
  
      // Atualiza o modelo com a data formatada corretamente
      this.user.birthdate = input.value;
    }
  }
  async updateBirthdate() {
    try {
      const isBirthdateValid = this.validateBirthdate(this.user.birthdate);
    if (!isBirthdateValid) {
      await this.presentToast('Data de nascimento inválida.');
      return;
    }
      const user = await this.afAuth.currentUser;
      if (user) {
        await this.firestore.collection('users').doc(user.uid).update({ birthdate: this.user.birthdate });
        this.presentToast('Data de nascimento atualizada com sucesso');
      }
    } catch (error) {
      this.presentToast('Erro ao atualizar a data de nascimento. Por favor, tente novamente.');
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

  async updateAddress() {
    const cepWithoutMask = this.cep.replace(/\D/g, '');
  
    if (cepWithoutMask.length === 8) {
      this.http.get<any>(`https://viacep.com.br/ws/${cepWithoutMask}/json/`).subscribe(data => {
        if (!data.erro) {
          this.rua = data.logradouro;
          this.bairro = data.bairro;
          this.cidade = data.localidade;
          this.estado = data.uf;
          this.updateFirebaseAddress();
        } else {
          console.error('CEP não encontrado.');
        }
      }, error => {
        console.error('Erro ao buscar dados do CEP.');
      });
    }
  }
  
  async updateFirebaseAddress() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await this.firestore.collection('users').doc(user.uid).update({
          cep: this.formatCEPForDatabase(this.cep),
          rua: this.rua,
          bairro: this.bairro,
          numero: this.numero,
          complemento: this.complemento,
          cidade: this.cidade,
          estado: this.estado
        });
        this.presentToast('Endereço atualizado com sucesso');
      }
    } catch (error) {
      this.presentToast('Erro ao atualizar o endereço. Por favor, tente novamente.');
    }
  }
  
  formatCEPForDatabase(cep: string): string {
    return cep.replace(/\D/g, ''); 
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
    this.user.cpf = cpf;
  }

  formatPhone(event: any) {
    let phone = event.target.value.replace(/\D/g, ''); 
    phone = phone.substring(0, 11); // Limitar a 11 dígitos
  
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
    this.user.phone = phone;
  }

  formatCEPForDisplay(cep: string): string {
    if (cep && cep.length === 8) {
      return cep.replace(/^(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  }
}
