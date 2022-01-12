import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import firebase from "firebase/app";
import "firebase/firestore";
import { Observable } from 'rxjs';
import { CourseComponent } from '../courseList/course/course.component';
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

  fname: any;

  viewCalendar = 'text';

  roleAdmin: boolean = false;
  roleMod: boolean = false;
  roleOfficer: boolean = false;
  roleStudent: boolean = false;

  roleHolder = "";

  selectRole = "Student";
  selectCourse: any;

  min: number = 1;
  max: number = 999;

  courseCon = "";
  courses: Observable<any[]>;
  courseRef: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore,
              private afAuth: AngularFireAuth,
              private router: Router,
              private loadingCtrl: LoadingController,
              private toaster: ToastController,
              private authService: AuthService,
              private modalCtrl: ModalController)

  {
    this.courseRef = afs.collection('course');
    this.courses = this.courseRef.valueChanges();
  }

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

  updateRole(role) {
    console.log(role + this.selectCourse);
  }

  async register(name: string, sname: string, email: string, studentId: string, bday: string, password: string){

    var config = {
      apiKey: "AIzaSyCLTuqIpjbHTQhS1URxvfKN9E2KR0rozAA",
      authDomain: "db-stuportal.firebaseapp.com"
    };

    var secondaryApp = firebase.initializeApp(config, "Secondary");

    if (name && email && studentId && password) {
      const loading = await this.loadingCtrl.create({
        message: 'Processing...',
        spinner: 'crescent',
        showBackdrop: true
      });

      loading.present();

      const profileUrl = "https://avatars.dicebear.com/api/avataaars/";
      const profileExt = ".svg";
      const profilePicture = profileUrl + this.fname + profileExt;

      if (this.selectRole === "Admin") {
        this.roleAdmin = true;
        this.roleHolder = "Admin";
        console.log("Hello Admin");
      } else if (this.selectRole === "Moderator") {
        this.roleMod = true;
        this.roleHolder = "Moderator";
        console.log("Hello Mod");
      } else if (this.selectRole === "Student Officer") {
        this.roleOfficer = true;
        this.roleHolder = "Student Officer";
        console.log("Hello Officer");
      } else if (this.selectRole === "Student") {
        this.roleStudent = true;
        this.roleHolder = "Student";
        console.log("Hello Student");
      }

      secondaryApp.auth().createUserWithEmailAndPassword(email, password).then((data) => {
        this.afs.collection('user').doc(data.user.uid).set({
          'userId': data.user.uid,
          'userName': name,
          'userSurname': sname,
          'userEmail': email,
          'birthday': bday,
          'userSchoolId': studentId,
          'role' : {
            'admin': this.roleAdmin,
            'moderator': this.roleMod,
            'officer': this.roleOfficer,
            'student': this.roleStudent
          },
          'roleName': this.roleHolder,
          'course': this.selectCourse,
          'userPhoto': profilePicture,
          'organizationId': [],
          'createdAt' : Date.now()
        })
        .then(() => {
          loading.dismiss();
          this.toast('New User added.', 'success');
          // this.authService.signOut();
          // this.authService.signIn("geronimoadalia@gmail.com", "123123");

          this.router.navigate(['/users']);
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

  async openCourses() {
    const modal = await this.modalCtrl.create({
      component: CourseComponent
    });
    return await modal.present();
  }

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

 allowNumber(ev: any) {
  var inp = String.fromCharCode(ev.keyCode);

  if (/[0-9]/.test(inp)) {
    return true;
  } else {
    ev.preventDefault();
    return false;
  }
  //https://codezup.com/angular-78910-input-validation-allow-only-numbers-or-alphanumeric/
 }

 getDate(form: NgForm) {
  let password = form.value.password;

  //Lastname
  let newName = password?.replace(/-| /g, "").toLowerCase();

  let pass = form.controls['password'].setValue(newName);

 }

 calendarMode() {
   this.viewCalendar = 'date';
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
    this.fname = form.value.fname;
    const sname = form.value.sname;
    const email = form.value.email;
    const studentId = form.value.studentId;
    const bday = form.value.birthdate;
    const pass = form.value.password;

    this.register(this.fname, sname, email, studentId, bday, pass);
    form.reset();
  }// end of submit


}
