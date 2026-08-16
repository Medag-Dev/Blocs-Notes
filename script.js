 

// =====================
// NOTES / TACHES SCROLL
// =====================

const t = document.querySelector(".t");
const n = document.querySelector(".n");
const h1 = document.querySelector("h1");

const notes = document.querySelector(".notes");
const taches = document.querySelector(".taches");


t.addEventListener("click", () => {

    t.style.borderBottom = "5px solid #4FC3F7";
    n.style.borderBottom = "none";

    h1.textContent = "Tâches";

    taches.style.display = "block";
    notes.style.display = "none";

});


n.addEventListener("click", () => {

    n.style.borderBottom = "5px solid #4FC3F7";
    t.style.borderBottom = "none";

    h1.textContent = "Notes";

    taches.style.display = "none";
    notes.style.display = "block";

});





// =====================
// MENU
// =====================

const menu = document.querySelector(".fa-bars-staggered");
const side = document.querySelector(".menu");


menu.addEventListener("click",()=>{

    menu.classList.toggle("fa-bars-staggered");
    menu.classList.toggle("fa-xmark");

    side.classList.toggle("block");

});





// =====================
// THEME
// =====================

const theme = document.querySelector(".fa-toggle-off");
const texteTheme = document.querySelector(".claire");


theme.addEventListener("click",()=>{


    theme.classList.toggle("fa-toggle-off");
    theme.classList.toggle("fa-toggle-on");


    document.body.classList.toggle("dark");



    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");
        texteTheme.textContent="Sombre";

    }else{

        localStorage.setItem("theme","light");
        texteTheme.textContent="Claire";

    }


});





// récupération du thème

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

    texteTheme.textContent="Sombre";


    theme.classList.replace(
        "fa-toggle-off",
        "fa-toggle-on"
    );

}





// =====================
// TACHES
// =====================


const input = document.getElementById("input");
const btnAdd = document.querySelector(".fa-circle-plus");
const liste = document.querySelector(".ul2");


let modification = null;


let tasks = JSON.parse(
    localStorage.getItem("tasks")
) || [];





// afficher tâche

function afficherTache(obj){


    const li = document.createElement("li");


    const p = document.createElement("p");

    p.textContent = obj.texte;



    if(obj.faite){

        p.classList.add("completed1");

        li.classList.add("completed2");

    }





    const check = document.createElement("i");

    check.classList.add(
        obj.faite ? "fa-solid" : "fa-regular",
        obj.faite ? "fa-square-check" : "fa-square"
    );




    const edit = document.createElement("i");

    edit.classList.add(
        "fa-solid",
        "fa-pencil"
    );




    const del = document.createElement("i");

    del.classList.add(
        "fa-solid",
        "fa-trash"
    );




    const date = document.createElement("article");

    date.textContent = obj.date;



    li.append(
        p,
        check,
        edit,
        del,
        date
    );



    liste.appendChild(li);





    // cocher tâche

    check.addEventListener("click",()=>{


        obj.faite = !obj.faite;


        sauvegarder();




        check.classList.toggle("fa-square");

        check.classList.toggle("fa-square-check");


        check.classList.toggle("fa-regular");

        check.classList.toggle("fa-solid");



        p.classList.toggle("completed1");

        li.classList.toggle("completed2");


    });





    // supprimer tâche

    del.addEventListener("click",()=>{


        li.classList.add("falling");



        li.addEventListener("animationend",()=>{


            tasks = tasks.filter(
                t => t !== obj
            );


            sauvegarder();


            li.remove();


        });


    });





    // modifier tâche

    edit.addEventListener("click",()=>{


        input.value = obj.texte;


        input.focus();


        modification = obj;


        li.remove();


    });



}





// sauvegarde tâches

function sauvegarder(){

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}





// chargement tâches

tasks.forEach(tache=>{

    afficherTache(tache);

});
// =====================
// AJOUT TACHES
// =====================


btnAdd.addEventListener("click",()=>{


    let valeur = input.value.trim();



    if(valeur===""){


        Toastify({

            text:"Votre tâche ne peut pas être vide",

            duration:2000,

            close:true,

            style:{
                background:
                "linear-gradient(135deg,#74EBD5,#ACB6E5)"
            }


        }).showToast();


        return;

    }





    // modification

    if(modification){


        modification.texte = valeur;


        sauvegarder();


        afficherTache(modification);


        modification=null;



    }else{


        const nouvelle = {


            texte: valeur,


            faite:false,


            date:new Date().toLocaleString("fr-FR")


        };



        tasks.push(nouvelle);


        sauvegarder();


        afficherTache(nouvelle);



    }



    input.value="";



});








// =====================
// FILTRE
// =====================


const select = document.querySelector("#filter");



select.addEventListener("change",()=>{


    const choix = select.value;



    document.querySelectorAll(".ul2 li")
    .forEach(li=>{


        const p = li.querySelector("p");



        if(choix==="Faites"){


            li.style.display =
            p.classList.contains("completed1")
            ?"flex"
            :"none";



        }

        else if(choix==="À Faire"){


            li.style.display =
            !p.classList.contains("completed1")
            ?"flex"
            :"none";



        }

        else{


            li.style.display="flex";


        }



    });



});








// =====================
// NOTES AVEC QUILL
// =====================


const addNote = document.querySelector(".fa-pen-to-square");


const editor = document.getElementById("editor");


const toolbar = document.getElementById("toolbar-container");


const saveNote = document.querySelector(".save");


const listeNotes = document.querySelector(".ul1");



let notesStock = JSON.parse(
    localStorage.getItem("notes")
) || [];



let noteModification = null;







// ouvrir / fermer éditeur


addNote.addEventListener("click",()=>{


    if(addNote.classList.contains("fa-eye-slash")){


        toolbar.style.display="none";

        editor.style.display="none";



    }else{


        toolbar.style.display="flex";

        editor.style.display="flex";


        quill.focus();


    }



    addNote.classList.toggle(
        "fa-pen-to-square"
    );


    addNote.classList.toggle(
        "fa-eye-slash"
    );



});









// afficher note


function afficherNote(note){


    const li = document.createElement("main");


    li.innerHTML = note.contenu;




    const supprimer = document.createElement("i");


    supprimer.classList.add(
        "fa-solid",
        "fa-trash"
    );




    const modifier = document.createElement("i");


    modifier.classList.add(
        "fa-solid",
        "fa-pencil"
    );





    const date = document.createElement("article");


    date.textContent = note.date;





    li.append(
        supprimer,
        modifier,
        date
    );



    listeNotes.appendChild(li);







    // supprimer note


    supprimer.addEventListener("click",()=>{


        li.classList.add("falling");



        li.addEventListener(
            "animationend",
            ()=>{


                notesStock =
                notesStock.filter(
                    n=>n!==note
                );



                sauvegarderNotes();


                li.remove();



            }
        );



    });








    // modifier note


    modifier.addEventListener("click",()=>{


        toolbar.style.display="flex";


        editor.style.display="flex";



        quill.root.innerHTML =
        note.contenu;



        noteModification = note;



        li.remove();



        quill.focus();



    });



}






// sauvegarde notes


function sauvegarderNotes(){


    localStorage.setItem(
        "notes",
        JSON.stringify(notesStock)
    );


}







// charger notes


notesStock.forEach(note=>{


    afficherNote(note);



});
// =====================
// ENREGISTRER UNE NOTE
// =====================


saveNote.addEventListener("click",(e)=>{


    e.preventDefault();



    const contenu = quill.root.innerHTML;


    const texte = quill.getText().trim();





    if(texte===""){


        Toastify({

            text:"Votre note doit contenir du texte",

            duration:2000,

            close:true,

            style:{
                background:
                "linear-gradient(135deg,#74EBD5,#ACB6E5)"
            }


        }).showToast();



        return;


    }





    // modification note

    if(noteModification){


        noteModification.contenu = contenu;



        sauvegarderNotes();



        afficherNote(noteModification);



        noteModification = null;



    }



    else{



        const nouvelleNote = {


            contenu: contenu,


            date: new Date().toLocaleString("fr-FR")



        };




        notesStock.push(nouvelleNote);



        sauvegarderNotes();



        afficherNote(nouvelleNote);



    }







    // fermer éditeur


    toolbar.style.display="none";


    editor.style.display="none";



    addNote.classList.toggle(
        "fa-pen-to-square"
    );


    addNote.classList.toggle(
        "fa-eye-slash"
    );



    quill.setText("");



});








// =====================
// PROFIL
// =====================


const profil = document.getElementById("profil");


const modalProfil = document.querySelector(".profil-modal");


const fermerProfil = document.querySelector(".close-profil");



const nomProfil = document.getElementById("profilNom");


const emailProfil = document.getElementById("profilEmail");







profil.addEventListener("click",(e)=>{


    e.preventDefault();



    const nom =
    localStorage.getItem("name")
    || "Non renseigné";



    const email =
    localStorage.getItem("email")
    || "Non renseigné";






    nomProfil.innerHTML = `

        <strong class="profil-label">
            Nom
        </strong>

        <br>

        ${nom}

    `;






    emailProfil.innerHTML = `

        <strong class="profil-label">
            Adresse e-mail
        </strong>

        <br>

        ${email}

    `;






    modalProfil.style.display="flex";



});







fermerProfil.addEventListener("click",()=>{


    modalProfil.style.display="none";


});







modalProfil.addEventListener("click",(e)=>{


    if(e.target === modalProfil){


        modalProfil.style.display="none";


    }


});









// =====================
// DECONNEXION
// =====================


const deconnexion = document.getElementById("deconnexion");



deconnexion.addEventListener("click",()=>{


    window.location.href="deco.html";


});

//sexe
const homme = document.querySelector(".homme");
const femme = document.querySelector(".femme");
const signe = document.querySelector(".fa-mars");
const selection = document.getElementById("sexe");

selection.addEventListener("change", () => {

    if (selection.value === "Femme") {
        localStorage.setItem("sexe", "femme");

        homme.style.display = "none";
        femme.style.display = "block";

        signe.classList.remove("fa-mars");
        signe.classList.add("fa-venus");

    } else {
        localStorage.setItem("sexe", "homme");

        homme.style.display = "block";
        femme.style.display = "none";

        signe.classList.remove("fa-venus");
        signe.classList.add("fa-mars");
    }

});

// Chargement de la préférence enregistrée
if (localStorage.getItem("sexe") === "femme") {

    homme.style.display = "none";
    femme.style.display = "block";

    signe.classList.remove("fa-mars");
    signe.classList.add("fa-venus");
    selection.value="Femme"

} else {
    selection.value="Homme"
    homme.style.display = "block";
    femme.style.display = "none";

    signe.classList.remove("fa-venus");
    signe.classList.add("fa-mars");

}