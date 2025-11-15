# mymood-journal
moodtracker


firebase's firestore database rule:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /moodEntries/{entry} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
