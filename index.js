//boton de iniciar sesion

const popUp = document.getElementById('pop-up')
const signIn = document.getElementById('log-in-btn')
const login = document.getElementById('login-button')

import { cargarUsuarios } from "./components/db/users.js"

// boton de registrar
const registerPopUp = document.getElementById('register-pop-up')
const registerBtn = document.getElementById('sign-in-btn')
const registerConfirm = document.getElementById('register-button')

//sign in boton

signIn.addEventListener('click',()=>{
    popUp.style.opacity = 1;
    popUp.style.pointerEvents = 'auto';
    popUp.style.transform = 'scale(1)';

    cargarUsuarios()

    document.body.classList.add('blur-active');
})

login.addEventListener('click', () =>{
    popUp.style.opacity = 0;
    popUp.style.pointerEvents = 'none';
    popUp.style.transform = 'scale(0.8)';
    document.body.classList.remove('blur-active');
})

//register boton

registerBtn.addEventListener('click', () => {
    registerPopUp.style.opacity = 1;
    registerPopUp.style.pointerEvents = 'auto';
    registerPopUp.style.transform = 'scale(1)';
    document.body.classList.add('blur-active');
})

registerConfirm.addEventListener('click', () => {
    registerPopUp.style.opacity = 0;
    registerPopUp.style.pointerEvents = 'none';
    registerPopUp.style.transform = 'scale(0.8)';
    document.body.classList.remove('blur-active');
})
