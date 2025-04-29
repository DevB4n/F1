const popUp = document.getElementById('pop-up')
const signIn = document.getElementById('log-in-btn')
const login = document.getElementById('login-button')


signIn.addEventListener('click',()=>{
    popUp.style.opacity = 1;
    popUp.style.pointerEvents = 'auto';
    popUp.style.transform = 'scale(1)';
})

login.addEventListener('click', () =>{
    popUp.style.opacity = 0;
    popUp.style.pointerEvents = 'none';
    popUp.style.transform = 'scale(0.8)';
})

