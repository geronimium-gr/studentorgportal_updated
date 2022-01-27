import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { LoadingController } from '@ionic/angular';
import { Post } from '../models/post.model';
import { User } from '../models/user';

import firebase from 'firebase/app';
import 'firebase/firestore'

@Injectable({
  providedIn: 'root'
})
export class ReactionsService {
  postCollection: AngularFirestoreCollection<Post>;
  userCollection: AngularFirestoreCollection<User>;

  constructor(private afs: AngularFirestore,
              private loadingCtrl: LoadingController) {
  }

  addLike(postId: string, userId: string, event: string) {

    const likeRef = firebase.firestore().collection(event).doc(postId);

    likeRef.update({
      postLikes: firebase.firestore.FieldValue.arrayUnion(userId)
    });
  }

  removeLike(postId: string, userId: string, event: string) {

    const likeRef = firebase.firestore().collection(event).doc(postId);

    likeRef.update({
      postLikes: firebase.firestore.FieldValue.arrayRemove(userId)
    });
  }
}
