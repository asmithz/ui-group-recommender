import express from "express"
import { Server as socketServer } from "socket.io"
import http from "http"
import cors from "cors"
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, query, where, updateDoc } from "firebase/firestore"
import db from "./firebase.js"
import child_process from 'child_process'
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"
import { stdout } from "process"

const exec = child_process.exec
const spawn = child_process.spawn

const app = express()
const server = http.createServer(app)

const io = new socketServer(server, {
    cors: {
        origin: "*"
    }
})

const ip = "192.168.1.10"

io.attach(7000)

app.use(cors())
app.use(express.json());
app.use("/imagenes-movielens", express.static("imagenes-movielens"))
app.use("/iconos", express.static("iconos"))

//socket
//cuando los usuarios se conectan
io.on("connection", (socket) => {
    socket.emit("sesion-usuario", (socket.id))
    //room
    socket.on("entrar-sala", () => {
        socket.join("sala")
        io.in("sala").emit("conectado")
        //aqui eliminar el fichero groups
        //if(fs.existsSync("/home/asmith/results/movielens1m")){}
    })
    // recomendaciones
    socket.on("obtener-recomendaciones", (recomendaciones) => {
        io.in("sala").emit("mostrar-recomendaciones", recomendaciones)
    })

    // si se desconecta el usuario
    socket.on("disconnect", async () => {
        try {
            io.emit("usuario-desconectado", socket.id)
            await deleteDoc(doc(db, "sala", socket.id))
            console.log("desconectado " + socket.id)
        }
        catch (error) {
            console.log(error)
        }
    })

    socket.on("cargando-enviar", (valor) => {
        io.in("sala").emit("cargando", valor)
    })
})

//apis
app.post("/login", async (req, res) => {
    try {
        var n_usuario = 6041
        let n_usuarios = []

        const usuarios = await getDocs(collection(db, "sala"))
        usuarios.forEach(async (documento) => {
            n_usuarios.push(parseInt(documento.data().numero_usuario))
        })

        for (let i = 0; i <= n_usuarios.length; i++) {
            if (!n_usuarios.includes(n_usuario)) {
                await setDoc(doc(db, "sala", req.body.id_sesion), {
                    nombre: req.body.nombre,
                    id_sesion: req.body.id_sesion,
                    imagen_path: req.body.imagen,
                    numero_usuario: n_usuario
                })
                break
            }
            n_usuario++
        }
    }
    catch (error) {
        console.log(error)
    }
    return res.json(req.body)
})

app.get("/check-usuario", async (req, res) => {
    try {
        const usuario = await getDoc(doc(db, "sala", req.body.id_sesion))
        if (usuario.exists()) {
            return res.json({
                "existe": true
            })
        }
        else {
            return res.json({
                "existe": false
            })
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/obtener-usuarios", async (req, res) => {
    try {
        let resp = {}
        const usuarios = await getDocs(collection(db, "sala"))
        usuarios.forEach((doc) => {
            resp[String(doc.id)] = doc.data()
        })
        return res.json(resp)
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/check-fichero-groups", async (req, res) => {
    try {
        let existeFichero = false
        if (fs.existsSync("/home/asmith/results/movielens1m-group-output/group")) {
            existeFichero = true
        }

        return res.json({
            existe: existeFichero
        })

    }
    catch (error) {
        console.log(error)
    }
})

app.post("/obtener-recomendaciones-individuales", async (req, res) => {
    try {
        const user = parseInt(req.body.numero_usuario) - 1
        let items = []
        let recomendaciones = fs.readFileSync("/home/asmith/results/movielens1m-group-output/group", "utf-8")
        let arrayRecomendaciones = recomendaciones.split("\n")
        for (let i = 0; i < arrayRecomendaciones.length; i++) {
            let recomendacion = arrayRecomendaciones[i].split(",")
            let usuario = recomendacion[0]
            let item = recomendacion[1]
            let rating_grupo = recomendacion[2]
            if (String(user) === usuario) {
                let path_imagen = "/home/asmith/web-librec/server-grouplibrec/imagenes-movielens/" + String(item) + ".jpg"

                if (fs.existsSync(path_imagen)) {
                    path_imagen = "http://" + ip + ":8000/imagenes-movielens/" + String(item) + ".jpg"
                }
                else {
                    path_imagen = "http://" + ip + ":8000/imagenes-movielens/no_existe.png"
                }
                items.push({
                    idPelicula: item,
                    ratingGrupo: rating_grupo,
                    pathImagen: path_imagen
                })
            }
        }
        let items_ordenados = items.sort(function (a, b) {
            return b.ratingGrupo - a.ratingGrupo
        })

        return res.json(items_ordenados)
    }
    catch (error) {
        console.log(error)
    }
})


app.post("/obtener-recomendaciones-grupo", async (req, res) => {
    let usuariosSesion = []
    let items = []
    try {
        const usuarios = await getDocs(collection(db, "sala"))
        usuarios.forEach((doc) => {
            usuariosSesion.push(String(parseInt(doc.data().numero_usuario) - 1))
        })
        let recomendaciones = fs.readFileSync("/home/asmith/results/movielens1m-group-output/group", "utf-8")
        let arrayRecomendaciones = recomendaciones.split("\n")
        for (let j = 0; j < usuariosSesion.length; j++) {
            for (let i = 0; i < arrayRecomendaciones.length; i++) {
                let recomendacion = arrayRecomendaciones[i].split(",")
                let usuario = recomendacion[0]
                let item = recomendacion[1]
                let rating_grupo = recomendacion[2]
                if (usuariosSesion[j] === usuario) {
                    let path_imagen = "/home/asmith/web-librec/server-grouplibrec/imagenes-movielens/" + String(item) + ".jpg"

                    if (fs.existsSync(path_imagen)) {
                        path_imagen = "http://" + ip + ":8000/imagenes-movielens/" + String(item) + ".jpg"
                    }
                    else {
                        path_imagen = "http://" + ip + ":8000/imagenes-movielens/no_existe.png"
                    }
                    items.push({
                        idUsuario: usuario,
                        idPelicula: item,
                        ratingGrupo: rating_grupo,
                        pathImagen: path_imagen
                    })
                }
            }
        }
        let items_ordenados = items.sort(function (a, b) {
            return b.ratingGrupo - a.ratingGrupo
        })
        return res.json(items_ordenados)
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/recomendar", async (req, res) => {
    try {
        // obtener cantidad de usuarios en la sesion para formar los grupos (AL MENOS 2 USUARIOS POR GRUPO)
        let cant_usuarios = 0
        let arrayUsuarios = []
        const usuarios = await getDocs(collection(db, "sala"))
        usuarios.forEach((doc) => {
            cant_usuarios += 1
            arrayUsuarios.push(String(doc.data().numero_usuario))
        })

        // reiniciar dataset movielens
        fs.copyFileSync("/home/asmith/data/movielens1mCopy", "/home/asmith/data/movielens1m")

        //reinicar config properties
        fs.copyFileSync("/home/asmith/group-movielensCopy.properties", "/home/asmith/group-movielens.properties")
        const groupSize = "group.similar.groupSize=" + String(cant_usuarios) + "\n"
        const semilla = "rec.random.seed=" + String(Math.floor(Math.random() * 1349333576093) + 1) + "\n"
        fs.appendFileSync("/home/asmith/group-movielens.properties", groupSize, "utf-8")
        fs.appendFileSync("/home/asmith/group-movielens.properties", semilla, "utf-8")

        // agregar calificaciones de los usuarios al dataset
        arrayUsuarios.forEach((fichero) => {
            let usuario_fichero = fs.readFileSync("/home/asmith/data/ratings/" + fichero, "utf-8")
            fs.appendFileSync("/home/asmith/data/movielens1m", usuario_fichero, "utf-8")
        })
        //fs.readdirSync("/home/asmith/data/ratings").forEach((fichero) => {
        //    let usuario_fichero = fs.readFileSync("/home/asmith/data/ratings/" + fichero, "utf-8")
        //    fs.appendFileSync("/home/asmith/data/movielens1m", usuario_fichero, "utf-8")
        //})

        // ejecutar script
        const script = spawn("/home/asmith/run_librec.sh")
        script.on("exit", (code, signal) => {
            return res.json({
                ejecutado: "true"
            })
        })


    }
    catch (error) {
        console.log(error)
        return res.json({
            copiado: "ocurrio un error"
        })
    }
})

app.get("/obtener-pelicula", (req, res) => {
    const id = req.body.idUsuario
    let idPelicula = Math.floor(Math.random() * 3952) + 1
    let nombrePelicula
    let tipoPelicula
    let peliculas = []

    try {
        //leer fichero de ratings
        if (fs.existsSync("/home/asmith/data/ratings/" + String(id))) {
            var data = fs.readFileSync("/home/asmith/data/ratings/" + String(id), "utf-8")
            data = data.split("\n")
            //obtener peliculas rankeadas del usuario
            for (let rating = 0; rating < data.length; rating++) {
                let rank_usuario = data[rating].split("::")[0]
                let rank_pelicula = data[rating].split("::")[1]
                if (String(id) === rank_usuario) {
                    peliculas.push(rank_pelicula)
                }
            }
            //si la pelicula fue rankeada, escoger otra
            while (peliculas.includes(String(idPelicula))) {
                idPelicula = Math.floor(Math.random() * 3952) + 1
            }
        }
        //leer fichero de peliculas: titulo, año, etc...
        let idPelicula2
        var data2 = fs.readFileSync("/home/asmith/data/movies", "utf-8")
        data2 = data2.split("\n")
        for (let pelicula = 0; pelicula < data2.length; pelicula++) {
            idPelicula2 = data2[pelicula].split("::")[0]
            if (idPelicula2 === String(idPelicula)) {
                nombrePelicula = data2[pelicula].split("::")[1]
                tipoPelicula = data2[pelicula].split("::")[2]
                break
            }
        }
    }
    catch (error) {
        console.log(error)
    }

    let path_imagen = "/home/asmith/web-librec/server-grouplibrec/imagenes-movielens/" + String(idPelicula) + ".jpg"

    if (fs.existsSync(path_imagen)) {
        path_imagen = "http://" + ip + ":8000/imagenes-movielens/" + String(idPelicula) + ".jpg"
    }
    else {
        path_imagen = "http://" + ip + ":8000/imagenes-movielens/no_existe.png"
    }

    return res.json({
        id_pelicula: idPelicula,
        nombre_pelicula: nombrePelicula,
        tipo_pelicula: tipoPelicula,
        imagen: path_imagen
    })
})

app.post("/calificar", (req, res) => {
    //escribir en el archivo las calificaciones
    let rating_usuario = req.body
    let id_usuario = String(rating_usuario.id_usuario)
    let id_pelicula = String(rating_usuario.id_pelicula)
    let rating_pelicula = String(rating_usuario.rating)
    let numb = Math.floor(Math.random() * 978300760) + 1
    let linea = id_usuario + "::" + id_pelicula + "::" + rating_pelicula + "::" + String(numb) + "\n"
    try {
        fs.appendFileSync("/home/asmith/data/ratings/" + String(id_usuario), linea, "utf-8")
        return res.json({
            estado: "agregado"
        })
    }
    catch (error) {
        console.log(error)
    }
})

app.delete("/eliminar-fichero", async (req, res) => {
    let usuario_idSesion = req.body?.id_sesion
    if(usuario_idSesion !== undefined){
      try {
	  const usuario = await getDoc(doc(db, "sala", usuario_idSesion))
	  const usuario_numero = usuario?.data()?.numero_usuario
	  if(usuario_numero !== undefined){
	    fs.unlinkSync("/home/asmith/data/ratings/" + String(usuario_numero))
	    return res.json({
		estado: "eliminado"
	    })
	  }
      }
      catch (error) {
	  console.log(error)
	  return res.json({
	      estado: "no existe o ya fue eliminado"
	  })
      }
    }
})

server.listen(8000)

console.log("Servidor iniciado en puerto 8000")
