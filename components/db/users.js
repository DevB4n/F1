//funcion para cargar usuarios del Json

export const cargarUsuarios = async () =>{
    const respuesta = await fetch('./db/users/users.json')
    const usuariosData = await respuesta.json();
    return usuariosData  
}

//funcion para filtrar


export const loginUsuarios = async(nombre,contraseña) =>{
    const listaUsuarios = await cargarUsuarios()
    console.log(contraseña)
    console.log(nombre)

    const usuarioEncontrado = listaUsuarios.find(
        usuario => usuario.nombre == nombre && usuario.contraseña == contraseña
    )

    if (usuarioEncontrado){
        alert('se inicio sesion correctamente')
        if(usuarioEncontrado.clase == 'admin'){
            localStorage.setItem('admin', true)
        }
        return true
    }else{
        alert ('cuenta no encontrada')
        return false
    }
}