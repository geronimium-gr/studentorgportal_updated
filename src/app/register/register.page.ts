import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  showPassword = false;
  passwordToggleIcon = 'eye';
  newGeneratedPassword: string;
  confirmPassword: string;
  passwordMatch: boolean;

  min: number = 1;
  max: number = 999;

  constructor(private afs: AngularFirestore,
              private afAuth: AngularFireAuth,
              private router: Router,
              private loadingCtrl: LoadingController,
              private toaster: ToastController,
              private authService: AuthService) { }

  ngOnInit() {
  }

  //Author: https://youtu.be/oIcgaAV8FIk
  togglePassword(){
    this.showPassword = !this.showPassword;

    if (this.passwordToggleIcon == 'eye') {
      this.passwordToggleIcon = 'eye-off';
    } else {
      this.passwordToggleIcon = 'eye';
    }
  }// end of TogglePassword

  checkPassword(){
    if (this.newGeneratedPassword === this.confirmPassword) {
      this.passwordMatch = true;
    } else {
      this.passwordMatch = false;
    }
  }// end

  //Author: https://www.codegrepper.com/code-examples/javascript/angular+random+password+generator
  generatePassword(passwordLength){
    const numberChar = "0123456789";
    const upperCaseChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseChar = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@$%^&*()_+<>?/,.";
    const allChars = numberChar + upperCaseChar + lowerCaseChar + symbols;

    let randPasswordArray = Array(passwordLength);
    randPasswordArray[0] = numberChar;
    randPasswordArray[1] = upperCaseChar;
    randPasswordArray[2] = lowerCaseChar;
    randPasswordArray[3] = symbols;

    randPasswordArray = randPasswordArray.fill(allChars, 4);
    return this.shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)]})).join('');
  } // end of generatePassword

  shuffleArray(array){
    for (let index = array.length - 1; index > 0; index--) {
      let j = Math.floor(Math.random() * (index + 1));
      let temp = array[index];
      array[index] = array[j];
      array[j] = temp;
    }
    return array;
  } // end of shuffleArray

  getPassword(){
    this.newGeneratedPassword = this.generatePassword(8);
  } // end

  async register(name: string, email: string, studentId: string, password: string){
    if (name && email && studentId && password) {
      const loading = await this.loadingCtrl.create({
        message: 'Processing...',
        spinner: 'crescent',
        showBackdrop: true
      });

      loading.present();

      const randomNum = this.profileGenerator(this.min, this.max);
      const profileUrl = "https://avatars.dicebear.com/api/identicon/";
      const profileExt = ".svg";
      const profilePicture = profileUrl + randomNum + profileExt;

      this.afAuth.createUserWithEmailAndPassword(email, password).then((data) => {
        this.afs.collection('user').doc(data.user.uid).set({
          'userId': data.user.uid,
          'userName': name,
          'userEmail': email,
          'userSchoolId': studentId,
          'role' : {
            'admin': false,
            'moderator': false,
            'officer': false,
            'student': true
          },
          'roleName': 'Student',
          'userPhoto': profilePicture,
          'createdAt' : Date.now()
        })
        .then(() => {
          loading.dismiss();
          this.toast('New User added.', 'success');
          this.authService.signOut();
          this.authService.signIn("geronimoadalia@gmail.com", "123123");
        })
        .catch(error => {
          loading.dismiss();
          this.toast(error.message, 'danger');
        })
      })
      .catch(error => {
        loading.dismiss();
        this.toast(error.message, 'danger');
      })
    }
  } // end of register

  emailGenerate(form: NgForm){
    let email = form.value.email;
    let newVal = email.replace(/ /g, "");
    let lowerCase = newVal.toLowerCase();

    let newEmail = form.controls['email'].setValue(lowerCase);

  }

 addDashes(ev: any, form: NgForm) {
   ev.preventDefault();

   let input = ev.target.value.split("-").join("");

   input = input.split('').map(function(cur, index){
     if (index == 2) {
      return "-" + cur;
     } else {
       return cur;
     }
   }).join('');

   let studentId = form.controls['studentId'].setValue(input);
 }

  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  } // end of toast

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }
    const user = form.value.fname;
    const email = form.value.email;
    const studentId = form.value.studentId;
    const pass = form.value.password;

    this.register(user, email, studentId, pass);
    form.reset();
  }// end of submit

  profileGenerator(min, max) {
    return Math.random() * (max - min) + min;
  }

}
