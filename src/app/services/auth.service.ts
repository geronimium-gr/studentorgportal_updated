import { Injectable } from '@angular/core';
import { User } from "../models/user";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import firebase from 'firebase/app';
import 'firebase/auth';
import { Router } from "@angular/router";
import { LoadingController, ToastController } from "@ionic/angular";
import { Observable, of, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  user: User;

  authSub: Subscription;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toaster: ToastController
  ) {
   this.user$ = this.afAuth.authState
      .pipe(
        switchMap( user => {
          if (user) {
            return this.afs.doc<User>(`user/${user.uid}`).valueChanges();
          } else {
            return of(null);
          }
        })
      )

  } //end of constructor

  async signIn(email, password){

    const loading = await this.loadingCtrl.create({
      message: 'Authenticating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present()

    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {

        // this.afs.collection('user', ref => ref.where("userEmail", "==", email))
        //   .get().subscribe(user => {
        //     console.log(user);
        //   });

        this.afAuth.signInWithEmailAndPassword(email, password)
          .then((data) => {
            loading.dismiss();
            this.router.navigate(['/home']);
          })
          .catch(error => {
           loading.dismiss();
           this.toast(error.message, 'danger');
          })
      })
      .catch(error => {
        loading.dismiss();
        this.toast(error.message, 'danger');
      });
  } // end of sign in

  async signOut(){

    const loading = await this.loadingCtrl.create({
      spinner: 'crescent',
      showBackdrop: true
    });
    loading.present();

    this.afAuth.signOut()
      .then(() => {
        loading.dismiss();

        this.router.navigate(['/login']);
      }).catch(error => {
        console.log("Catch");
        console.log(error.message);
      });
  } // end of signout

  async toast(message, status){

    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });
    toast.present();
  } //end of toast

  private checkAuthorization(user: User, allowedRoles: string[]): boolean {
    if (!user) return false;

    for (const role of allowedRoles){
      if (user.role[role]) {
        return true;
      }
    }
    return false;
  }

  canRead(user: User): boolean {
    const allowed = ['admin', 'moderator', 'officer', 'student'];
    return this.checkAuthorization(user, allowed);
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'moderator'];
    return this.checkAuthorization(user, allowed);
  }

  canDelete(user: User): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }
}
