// Import stylesheets
import "./style.css";
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from "firebaseui";

// Document elements
const startRsvpButton = document.getElementById("startRsvp");
const guestbookContainer = document.getElementById("guestbook-container");

const form = document.getElementById("leave-message");
const input = document.getElementById("message");
const guestbook = document.getElementById("guestbook");
const numberAttending = document.getElementById("number-attending");
const rsvpYes = document.getElementById("rsvp-yes");
const rsvpNo = document.getElementById("rsvp-no");

var rsvpListener = null;
var guestbookListener = null;

async function main() {
  // Add Firebase project configuration object here
  var firebaseConfig = {
    apiKey: "AIzaSyDlSKfUEqIFlUpQOXyTxRnEg9gDpJpcH_Y",
    authDomain: "project-ipiesa.firebaseapp.com",
    projectId: "project-ipiesa",
    storageBucket: "project-ipiesa.appspot.com",
    messagingSenderId: "678785053599",
    appId: "1:678785053599:web:f9783bb22d0cb0973cc3aa"
  };

  firebase.initializeApp(firebaseConfig);

  // FirebaseUI config
  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      }
    }
  };

  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  // Listen to RSVP button clicks
  startRsvpButton.addEventListener("click", () => {
    if (firebase.auth().currentUser) {
      // User is signed in; allows user to sign out
      firebase.auth().signOut();
    } else {
      // No user is signed in; allows user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  });

  // Listen to the current Auth state
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      startRsvpButton.textContent = "LOGOUT";
      // Show guestbook to logged-in users
      guestbookContainer.style.display = "block";
      subscribeGuestbook();
      subscribeCurrentRSVP(user);
    } else {
      startRsvpButton.textContent = "LOGIN/REGISTER";
      // Hide guestbook for non-logged-in users
      guestbookContainer.style.display = "none";
      unsubscribeGuestbook();
      unsubscribeCurrentRSVP();
    }
  });

  // Listen to the form submission
  form.addEventListener("submit", e => {
    // Prevent the default form redirect
    e.preventDefault();
    // Write a new message to the database collection "guestbook"
    firebase
      .firestore()
      .collection("guestbook")
      .add({
        text: input.value,
        timestamp: Date.now(),
        name: firebase.auth().currentUser.displayName,
        userId: firebase.auth().currentUser.uid
      });
    // clear message input field
    input.value = "";
    // Return false to avoid redirect
    return false;
  });

  // Listen to RSVP responses
  rsvpYes.onclick = () => {
    // Get a reference to the user's document in the attendees collection
    const userDoc = firebase
      .firestore()
      .collection("attendees")
      .doc(firebase.auth().currentUser.uid);

    // If they RSVP'd yes, save a document with attending: true
    userDoc
      .set({
        attending: true
      })
      .catch(console.error);
  };

  rsvpNo.onclick = () => {
    // Get a reference to the user's document in the attendees collection
    const userDoc = firebase
      .firestore()
      .collection("attendees")
      .doc(firebase.auth().currentUser.uid);

    // If they RSVP'd yes, save a document with attending: true
    userDoc
      .set({
        attending: false
      })
      .catch(console.error);
  };

  // Listen for attendee list
  firebase
    .firestore()
    .collection("attendees")
    .where("attending", "==", true)
    .onSnapshot(snap => {
      const newAttendeeCount = snap.docs.length;

      numberAttending.innerHTML =
        newAttendeeCount + " persoane care deja si-au gasit piesa !";
    });
}
main();

// Listen to guestbook updates
function subscribeGuestbook() {
  // Create query for messages
  guestbookListener = firebase
    .firestore()
    .collection("guestbook")
    .orderBy("timestamp", "desc")
    .onSnapshot(snaps => {
      // Reset page
      guestbook.innerHTML = "";
      // Loop through documents in database
      snaps.forEach(doc => {
        // Create an HTML entry for each document and add it to the chat
        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text;
        guestbook.appendChild(entry);
      });
    });
}

// Unsubscribe from guestbook updates
function unsubscribeGuestbook() {
  if (guestbookListener != null) {
    guestbookListener();
    guestbookListener = null;
  }
}

// Listen for attendee list
function subscribeCurrentRSVP(user) {
  rsvpListener = firebase
    .firestore()
    .collection("attendees")
    .doc(user.uid)
    .onSnapshot(doc => {
      if (doc && doc.data()) {
        const attendingResponse = doc.data().attending;

        // Update css classes for buttons
        if (attendingResponse) {
          rsvpYes.className = "clicked";
          rsvpNo.className = "";
        } else {
          rsvpYes.className = "";
          rsvpNo.className = "clicked";
        }
      }
    });
}

function unsubscribeCurrentRSVP() {
  if (rsvpListener != null) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className = "";
  rsvpNo.className = "";

  ///

  var provider = new firebase.auth.GoogleAuthProvider();
  var user;
  var selectedFile;

  $(document).ready(function() {
    $("#welcome").hide();
    $(".upload-group").hide();
    document
      .getElementById("upload")
      .addEventListener("change", handleFileSelect, false);
  });

  function signIn() {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        user = result.user;
        showWelcomeContainer();
        // ...
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  }

  function showWelcomeContainer() {
    $("#login").hide();
    $("#welcome").show();
    $("#welcomeText").html("Hello, " + user.displayName);
  }

  $(".dropdown").on("hide.bs.dropdown", function(event) {
    var text = $(event.relatedTarget).text(); // Get the text of the element
    $("#dogDrop").html(text + '<span class="caret"></span>');
    firebase
      .database()
      .ref("Users/" + user.uid)
      .set({
        name: user.displayName,
        email: user.email,
        favDog: text
      });
  });

  function handleFileSelect(event) {
    $(".upload-group").show();
    selectedFile = event.target.files[0];
  }

  function confirmUpload() {
    var metadata = {
      contentType: "image",
      customMetadata: {
        partType: "Lab",
        uploadedBy: user.uid,
        title: $("#imgTitle").val(),
        caption: $("#imgDesc").val()
      }
    };
    var uploadTask = firebase
      .storage()
      .ref()
      .child("PartImages/" + selectedFile.name)
      .put(selectedFile, metadata);
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      function(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // See below for more detail
      },
      function(error) {
        // Handle unsuccessful uploads
      },
      function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        $(".upload-group")[0].before("Success!");
        $(".upload-group").hide();
      }
    );
  }
}

main();
