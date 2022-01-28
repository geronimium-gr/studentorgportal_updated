import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, PopoverController } from '@ionic/angular';
import firebase from 'firebase/app';
import 'firebase/auth';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
})
export class UpdatePasswordComponent implements OnInit {

  oldPassword: string;
  newPassword: string;
  confirmPassword: string;

  passwordMatch: boolean;
  cPasswordMatch = true;

  viewPass: boolean = false;
  showPassword: boolean = false;

  constructor(private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private popOverCtrl: PopoverController) { }

  ngOnInit() {}

  checkPassword(){
    if (this.oldPassword === this.newPassword) {
      this.passwordMatch = true;
    } else {
      this.passwordMatch = false;
    }
  }// end

  checkConfirmPassword(){
    if (this.newPassword === this.confirmPassword) {
      this.cPasswordMatch = true;
    } else {
      this.cPasswordMatch = false;
    }
  }// end

  async updatePassword(){
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    const cpUser = firebase.auth().currentUser;

    const credentials = firebase.auth.EmailAuthProvider.credential(
      cpUser.email, this.oldPassword
    );

    cpUser.reauthenticateWithCredential(credentials).then(
      success => {
        if (this.newPassword != this.confirmPassword) {
          loading.dismiss();
          this.alertController('Update Password Failed', 'You did not confirm your password correctly.', 'Try Again');
        } else if (this.newPassword.length < 6){
          loading.dismiss();
          this.alertController('Update Password Failed', 'Password should be at least 6 characters long', 'Try Again');
        } else {
          loading.dismiss();
          this.alertController('Update Password Success', 'Password has been updated.', 'OK');
          this.closePopOver();
          cpUser.updatePassword(this.newPassword).then(function(){
            console.log("Success");
          }).catch(function(error){
            console.log("Failed. " + error);
          });
        }
      },
      error => {
        console.log(error);
        if (error.code === "auth/wrong-password") {
          loading.dismiss();
          this.alertController('Update Password Failed', error.message, 'Try Again');
        }//if
      }//error
    ).catch(error => {
      console.log("Failed. " + error);
    })//reauth
  }//

  async alertController(header, message, button){
    let alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [ button ]
    });
    alert.present();
  }//

  viewPassword(){
    this.viewPass = !this.viewPass;
    console.log("View Pass: " + this.viewPass);

    if (this.viewPass) {
      this.showPassword = true;
    } else {
      this.showPassword = false;
    }
  }//

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
      this.newPassword = this.generatePassword(8);
    } // end

  closePopOver(){
    this.popOverCtrl.dismiss();
  }

}
