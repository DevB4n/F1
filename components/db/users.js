//funcion para cargar usuarios del Json

export const cargarUsuarios = async () =>{
    const respuesta = await fetch('./db/users/users.json')
    const usuariosData = await respuesta.json();
    console.log(usuariosData)  
}

//funcion para filtrar


export const loginUsuarios = async(nombre,contraseña) =>{
    console.log(nombre.value)
    console.log(contraseña.value)    
}