import 'dotenv/config'
import express from "express"
import { Server as socketServer } from "socket.io"
import http from "http"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import child_process from 'child_process'
import * as fs from "fs"


const exec = child_process.exec
const spawn = child_process.spawn

const app = express()
const server = http.createServer(app)

const io = new socketServer(server, {
    cors: {
        origin: "*"
    }
})


const server_ip = process.env.SERVER_IP
const exec_grouplibrec = process.env.DIR_GROUPLIBREC
const exec_individualLibrec = process.env.DIR_INDIVIDUALLIBREC
const dir_recommendations_users = process.env.DIR_RECOMMENDATIONS_USERS
const dir_recommendations_dataset_users = process.env.DIR_RECOMMENDATIONS_DATASET_USERS_DATA
const user_recomendations_properties = process.env.USER_RECOMMENDATIONS_PROPERTIES
const group_recomendations_properties = process.env.GROUP_RECOMMENDATIONS_PROPERTIES
const recommendations_results_users = process.env.RECOMMENDATIONS_RESULTS_USERS
const dir_movielens_images = process.env.DIR_MOVIELENS_IMAGES
const dir_recommendations_rooms = process.env.DIR_RECOMMENDATIONS_ROOMS
const dir_recommendations_results = process.env.DIR_RECOMMENDATIONS_RESULTS
const dir_ratings = process.env.DIR_RATINGS
const dir_movies_names = process.env.DIR_MOVIES_IMAGES
const movielens_images = process.env.MOVIELENS_IMAGES
const dir_icons = process.env.DIR_ICONS
const db_url = process.env.DB_URL
const db_name = process.env.DB_NAME
console.log(dir_recommendations_rooms)

const socket_port = process.env.SOCKET_PORT
const server_port = process.env.SERVER_PORT

io.attach(socket_port)

app.use(cors())
app.use(express.json())
app.use(movielens_images, express.static("imagenes-movielens"))
app.use(dir_icons, express.static("iconos"))

const url = db_url
const dbName = db_name

// socket
// cuando los usuarios se conectan
io.on("connection", (socket) => {
    // Se envia un socket.id a la interfaz login
    socket.emit("sesion-usuario", (socket.id))
    // Genera la sesion del usuario cuando ingresa: su socket.id y id.usuario
    socket.on("generar-sesion", async (idSesion, usuarioId) => {
        try {
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            const sesion = await db.collection("sesiones").insertOne({ "id_sesion": socket.id, "id_usuario": usuarioId })
        }
        catch (error) {
            console.log(error)
        }
    })
    // entrar sala
    socket.on("entrar-sala", async (idGrupo, idSesion) => {
        try {
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            const sesion_usuario = await db.collection("sesiones").findOne({ id_sesion: idSesion })
            if (sesion_usuario) {
                const user = await db.collection("usuarios").findOne({ _id: new ObjectId(sesion_usuario.id_usuario) })
                socket.join(idGrupo)
                io.in(idGrupo).emit("update-grupo")
                const userEnGrupo = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo), usuarios_activos: { $elemMatch: user } })
                // si no esta en el grupo agregarlo
                if (!userEnGrupo) {
                    await db.collection("salas").updateOne(
                        { _id: new ObjectId(idGrupo) },
                        { $addToSet: { usuarios_activos: user } }
                    )
                    await db.collection("salas").updateOne(
                        { _id: new ObjectId(idGrupo) },
                        {
                            $addToSet: {
                                recomendaciones_stack: {
                                    id_usuario: sesion_usuario.id_usuario,
                                    items: []
                                }
                            }
                        }
                    )
                }
            }
        }
        catch (error) {
            console.log(error)
        }
    })
    // salir sala
    socket.on("salir-sala", async (idGrupo, idSesion) => {
        try {
            const salas_creadas = io.of("/").adapter.rooms
            for (const [idSala, socket_sala_id] of salas_creadas) {
                if (socket_sala_id.has(socket.id)) {
                    socket.leave(idSala)
                }
            }
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            const sesion_usuario = await db.collection("sesiones").findOne({ id_sesion: idSesion })
            if (sesion_usuario) {
                const user = await db.collection("usuarios").findOne({ _id: new ObjectId(sesion_usuario.id_usuario) })
                const userGrupo = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo), usuarios_activos: { $elemMatch: user } })
                if (userGrupo) {
                    await db.collection("salas").updateOne(
                        { _id: userGrupo._id },
                        {
                            $pull:
                                { usuarios_activos: { _id: new ObjectId(user._id) } }
                        }
                    )
                }
            }
            io.in(idGrupo).emit("update-grupo")
        }
        catch (error) {
            console.log(error)
        }
    })


    // si se desconecta el usuario
    socket.on("disconnect", async () => {
        try {
            //manejar si es lider eliminar el grupo? si se desconecta sacarlo de usuarios_activos
            //io.emit("usuario-desconectado", socket.id)
            //const salaId = null
            //const salas_creadas = io.of("/").adapter.rooms
            ////console.log(salas_creadas)
            //for(const [idSala, socket_sala_id] of salas_creadas){
            //    if(socket_sala_id.has(socket.id)){
            //        socket.leave(idSala)
            //        salaId = idSala
            //        console.log("ha salido de la sala "+salaId)
            //    }
            //}
            //
            //
            //
            //
            //const client = await MongoClient.connect(url)
            //const db = client.db(dbName)
            //const usuarioSesion = await db.collection("sesiones").findOne({ id_sesion: socket.id })
            //if(usuarioSesion){
            //    const usuarioId = usuarioSesion.id_usuario
            //    const sacarUsuarioGrupo = await db.collection("salas").updateOne(
            //        { _id: salaId  }, 
            //        { $pull: 
            //            { usuarios_activos: { _id: new ObjectId(usuarioId) } }
            //        }
            //    )
            //    console.log(usuarioId)
            //}

            //await db.collection("salas").deleteOne({ _id: new ObjectId(idGrupo) })
            // eliminar sesion del usuario desconectado 
            //await db.collection("sesiones").deleteOne({ id_sesion: socket.id })
            //client.close()
            console.log("desconectado " + socket.id)
        }
        catch (error) {
            console.log(error)
        }
    })

    // recomendaciones
    socket.on("enviar-grupo-recomendaciones", (idGrupo, recomendaciones) => {
        io.in(idGrupo).emit("mostrar-grupo-recomendaciones", recomendaciones)
    })

    socket.on("cargando-enviar", (idGrupo, valor) => {
        io.in(idGrupo).emit("cargando", valor)
    })

    socket.on("chat-enviar-mensaje", (idGrupo) => {
        io.in(idGrupo).emit("chat-desplegar-mensajes")
    })

})

//apis
app.post("/registrar-usuario", async (req, res) => {
    let usuario = {
        usuario: req.body.usuario,
        nombre: req.body.nombre,
        edad: req.body.edad,
        educacion: req.body.educacion,
        password: req.body.password,
        recomendaciones: [],
        imagen_usuario: req.body.imagen_usuario,
        calificaciones: []
    }
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        await db.collection("usuarios").insertOne(usuario)
        client.close()
    }
    catch (error) {
        console.log(error)
    }
    return res.json(req.body)
})

app.post("/login-usuario", async (req, res) => {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const usuario = await db.collection("usuarios").findOne({ "usuario": req.body.usuario });
        if (usuario) {
            if (usuario.password === req.body.password) {
                return res.json({ "respuesta": "ingreso", "usuario_id": usuario._id.toString() })
            }
            else {
                return res.json("error")
            }
        }
    }
    catch (error) {
        return res.json(error)
    }
    return res.json("no se encontro el usuario o contraseña equivocada")
})

app.post("/login", async (req, res) => {
    try {
        var n_usuario = 6041
        let n_usuarios = []

        const client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const usuarios = await db.collection("sala").find({}).toArray();
        usuarios.forEach(async (documento) => {
            n_usuarios.push(parseInt(documento.numero_usuario))
        })

        for (let i = 0; i <= n_usuarios.length; i++) {
            if (!n_usuarios.includes(n_usuario)) {
                await db.collection("sala").insertOne({
                    nombre: req.body.nombre,
                    id_sesion: req.body.id_sesion,
                    imagen_path: req.body.imagen,
                    numero_usuario: n_usuario
                });
                break
            }
            n_usuario++
        }
        client.close();
    }
    catch (error) {
        console.log(error)
    }
    return res.json(req.body)
})

// Crear sala
app.post("/crear-sala", async (req, res) => {
    let sala = {
        id_sala: req.body.id_sala,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        lider: req.body.lider,
        usuarios_activos: [],
        chat: [],
        recomendaciones_grupal: [],
        recomendaciones_individual: [],
        recomendaciones_stack: []
    }
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        await db.collection("salas").insertOne(sala)
        return res.json("ok")
    }
    catch (error) {
        return res.json("not ok")
    }
})

// Obtener salas
app.get("/obtener-salas", async (req, res) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const salas = await db.collection("salas").find({}).toArray()
        return res.json(salas)
    }
    catch (error) {
        console.log(error)
        return res.json("error")
    }
    return res.json("sin salas")
})

// Check if a document exists in a collection
app.get("/check-usuario", async (req, res) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("sala").findOne({ _id: req.body.id_sesion })
        if (usuario) {
            return res.json({
                "existe": true
            });
        } else {
            return res.json({
                "existe": false
            });
        }
    } catch (error) {
        console.log(error);
    }
})

app.get("/obtener-sala", async (req, res) => {
    try {
        const idGrupo = req.query.idGrupo
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo) })
        if (sala) {
            return res.json(sala)
        }
        return res.json(null)
    }
    catch (error) {
        console.log(error)
    }
})

// Obtener un usuario segun id
app.get("/obtener-usuario", async (req, res) => {
    try {
        const id_usuario = req.query.idUsuario
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(id_usuario) })
        if (usuario) {
            return res.json(usuario)
        }
        return res.json(null)
    } catch (error) {
        console.log(error)
    }
})

// Retrieve all documents from a collection
app.get("/obtener-usuarios", async (req, res) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuarios = await db.collection("sala").find({}).toArray()
        let resp = {}
        usuarios.forEach((doc) => {
            resp[String(doc._id)] = doc
        });
        return res.json(resp)
    } catch (error) {
        console.log(error)
    }
});

// Obtener usuarios del grupo
app.get("/obtener-usuarios-grupo", async (req, res) => {
    try {
        const idSala = req.query.idGrupo
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne({ _id: new ObjectId(idSala) })
        if (sala) {
            return res.json(sala.usuarios_activos)
        }
        return res.json(null)
    }
    catch (error) {
        console.log(error)
        return res.json(null)
    }
})

// Obtener chat sala
app.get("/obtener-chat-grupo", async (req, res) => {
    try {
        const idSala = req.query.idGrupo
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne({ _id: new ObjectId(idSala) })
        if (sala) {
            return res.json(sala.chat)
        }
        return res.json(null)
    }
    catch (error) {
        console.log(error)
        return res.json(null)
    }
})

// Enviar mensaje chat
app.post("/enviar-mensaje-chat", async (req, res) => {
    try {
        const idSala = req.body.idGrupo
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const n_usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(req.body.id_usuario) })
        if (n_usuario) {
            let info_mensaje = {}
            if (req.body.tipo_mensaje === "texto") {
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    "texto": req.body.texto,
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "texto"
                }
            }
            else if (req.body.tipo_mensaje === "item") {
                let path_imagen = dir_movielens_images + "/" + String(req.body.itemId) + ".jpg"
                if (fs.existsSync(path_imagen)) {
                    path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/" + String(req.body.itemId) + ".jpg"
                }
                else {
                    path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/no_existe.png"
                }
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    "texto": req.body.texto,
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "item",
                    "pathItem": path_imagen,
                    "idItem": req.body.itemId
                }
            }
            const nuevo_mensaje = await db.collection("salas").updateOne(
                { _id: new ObjectId(idSala) },
                { $push: { chat: info_mensaje } }
            )
            if (nuevo_mensaje) {
                return res.json("mensaje enviado")
            }
        }
        return res.json(null)
    }
    catch (error) {
        console.log(error)
        return res.json(null)
    }
})

app.get("/ejecutar-recomendacion-individual", async (req, res) => {
    const idUsuario = req.query.idUsuario
    const idGrupo = req.query.idGrupo
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(idUsuario) })
        if (usuario) {
            // crear directorio del usuario si no existe
            const directorioUsuario = dir_recommendations_users + "/" + idUsuario
            const directorioDataUsuario = directorioUsuario + "/data"

            if (!fs.existsSync(directorioUsuario)) {
                fs.mkdirSync(directorioUsuario)
            }
            if (!fs.existsSync(directorioDataUsuario)) {
                fs.mkdirSync(directorioDataUsuario)
            }
            const userData = directorioDataUsuario + "/user_data"

            // crear y/o reiniciar dataset del grupo
            fs.copyFileSync(dir_recommendations_dataset_users, userData)

            // añadir calificaciones de usuario al dataset
            usuario.calificaciones.forEach((item) => {
                var linea = item.linea
                fs.appendFileSync(userData, linea)
            })

            // crear y/o reiniciar properties de la sala
            const directorioUsuarioProperties = directorioUsuario + "/user.properties"
            fs.copyFileSync(user_recomendations_properties, directorioUsuarioProperties)

            // agregar propiedades a las propiedades del grupo
            const semilla = String(2) + "\n"
            const recommenderAlgo = "biasedmf\n"
            const directorioResultado = recommendations_results_users + "\n"
            const dataInputPathName = "user_data" + "\n"
            fs.appendFileSync(directorioUsuarioProperties, "\nrec.random.seed=" + semilla)
            fs.appendFileSync(directorioUsuarioProperties, "rec.recommender.class=" + recommenderAlgo)
            fs.appendFileSync(directorioUsuarioProperties, "dfs.data.dir=" + directorioDataUsuario + "\n")
            fs.appendFileSync(directorioUsuarioProperties, "dfs.result.dir=" + directorioResultado)
            fs.appendFileSync(directorioUsuarioProperties, "data.input.path=" + dataInputPathName)

            // ejectuar grouplibrec
            const args = ["-jar", exec_individualLibrec, "-exec", "-conf", idGrupo, directorioUsuarioProperties, idUsuario]
            const grouplibrec = spawn("java", args)
            grouplibrec.stdout.on("data", (data) => {
                console.log(`out: ${data}`)
            })
            grouplibrec.stderr.on("data", (data) => {
                console.log(`error: ${data}`)
            })
            grouplibrec.on("close", (code) => {
                if (code === 0) {
                    // devolver items recomendados para el grupo
                    console.log(`exit success: ${code}`)
                    const directorioResultadosSala = recommendations_results_users + "/" + idGrupo + "/" + idUsuario + "/"
                    let items = []
                    const recomendaciones = fs.readdirSync(directorioResultadosSala)
                    const directorioUltimaRecomendacion = recomendaciones.sort()[recomendaciones.length - 1]
                    let trecomendaciones = fs.readFileSync(directorioResultadosSala + directorioUltimaRecomendacion + "/recommendations.txt", "utf-8")
                    let arrayRecomendaciones = trecomendaciones.split("\n")
                    for (let i = 0; i < arrayRecomendaciones.length; i++) {
                        let recomendacion = arrayRecomendaciones[i].split(",")
                        let grupo = recomendacion[0]
                        let item = recomendacion[1]
                        let rating_grupo = recomendacion[2]
                        let path_imagen = dir_movielens_images + "/" + String(item) + ".jpg"
                        if (fs.existsSync(path_imagen)) {
                            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/" + String(item) + ".jpg"
                        }
                        else {
                            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/no_existe.png"
                        }
                        items.push({
                            idGrupo: grupo,
                            idItem: item,
                            ratingGrupo: rating_grupo,
                            pathImagen: path_imagen
                        })
                    }
                    let items_ordenados = items.sort(function (a, b) {
                        return b.ratingGrupo - a.ratingGrupo
                    })
                    return res.json(items_ordenados)
                }
                else {
                    console.log(`exit error: ${code}`)
                }
            })
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/ejecutar-recomendacion-grupal", async (req, res) => {
    const idSala = req.query.idGrupo
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne({ _id: new ObjectId(idSala) })
        const groupUsers = []
        if (sala) {
            // crear directorio del grupo si no existe
            const directorioGrupo = dir_recommendations_rooms + "/" + idSala
            const directorioDataGrupo = directorioGrupo + "/data"

            if (!fs.existsSync(directorioGrupo)) {
                fs.mkdirSync(directorioGrupo)
            }
            if (!fs.existsSync(directorioDataGrupo)) {
                fs.mkdirSync(directorioDataGrupo)
            }
            const usersDataGroup = directorioDataGrupo + "/users_data"

            // crear y/o reiniciar dataset del grupo
            fs.copyFileSync(dir_recommendations_dataset_users, usersDataGroup)

            // añadir calificaciones de usuarios al dataset
            sala.usuarios_activos.forEach((usuario) => {
                groupUsers.push(usuario._id.toString())
                usuario.calificaciones.forEach((calificacion) => {
                    var idItem = calificacion.id_item
                    var linea = calificacion.linea
                    fs.appendFileSync(usersDataGroup, linea)
                })
            })

            // crear y/o reiniciar properties de la sala
            const directorioProperties = directorioGrupo + "/group.properties"
            fs.copyFileSync(group_recomendations_properties, directorioProperties)

            // agregar propiedades a las propiedades del grupo
            const semilla = String(2) + "\n"
            const recommenderAlgo = "biasedmf\n"
            const directorioData = usersDataGroup + "\n"
            const directorioResultado = dir_recommendations_results + "\n"
            const dataInputPathName = "users_data" + "\n"
            const groupSize = String(sala.usuarios_activos.length) + "\n"
            fs.appendFileSync(directorioProperties, "\nrec.random.seed=" + semilla)
            fs.appendFileSync(directorioProperties, "group.base.recommender.class=" + recommenderAlgo)
            fs.appendFileSync(directorioProperties, "dfs.data.dir=" + directorioDataGrupo + "\n")
            fs.appendFileSync(directorioProperties, "dfs.result.dir=" + directorioResultado)
            fs.appendFileSync(directorioProperties, "group.similar.groupSize=" + groupSize)
            fs.appendFileSync(directorioProperties, "data.input.path=" + dataInputPathName)

            // ejectuar grouplibrec
            const args = ["-jar", exec_grouplibrec, "-exec", "-conf", idSala, directorioProperties, ...groupUsers]
            //const javaVersionPath = "/home/asmith/java/java-11-openjdk-amd64/bin/java"
            const grouplibrec = spawn("java", args)
            grouplibrec.stdout.on("data", (data) => {
                console.log(`out: ${data}`)
            })
            grouplibrec.stderr.on("data", (data) => {
                console.log(`error: ${data}`)
            })
            grouplibrec.on("close", (code) => {
                if (code === 0) {
                    // devolver items recomendados para el grupo
                    console.log(`exit success: ${code}`)
                    const directorioResultadosSala = dir_recommendations_results + "/" + idSala + "/"
                    let items = []
                    const recomendaciones = fs.readdirSync(directorioResultadosSala)
                    const directorioUltimaRecomendacion = recomendaciones.sort()[recomendaciones.length - 1]
                    let trecomendaciones = fs.readFileSync(directorioResultadosSala + directorioUltimaRecomendacion + "/recommendations.txt", "utf-8")
                    let arrayRecomendaciones = trecomendaciones.split("\n")
                    for (let i = 0; i < arrayRecomendaciones.length; i++) {
                        let recomendacion = arrayRecomendaciones[i].split(",")
                        let grupo = recomendacion[0]
                        let item = recomendacion[1]
                        let rating_grupo = recomendacion[2]
                        let path_imagen = dir_movielens_images + "/" + String(item) + ".jpg"
                        if (fs.existsSync(path_imagen)) {
                            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/" + String(item) + ".jpg"
                        }
                        else {
                            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/no_existe.png"
                        }
                        items.push({
                            idGrupo: grupo,
                            idItem: item,
                            ratingGrupo: rating_grupo,
                            pathImagen: path_imagen
                        })
                    }
                    let items_ordenados = items.sort(function (a, b) {
                        return b.ratingGrupo - a.ratingGrupo
                    })
                    return res.json(items_ordenados)
                }
                else {
                    console.log(`exit error: ${code}`)
                }
            })
        }
    }
    catch (error) {
        console.log(error)
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
        if (fs.existsSync(dir_ratings + "/" + String(id))) {
            var data = fs.readFileSync(dir_ratings + "/" + String(id), "utf-8")
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
        var data2 = fs.readFileSync(dir_movies_names, "utf-8")
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

    let path_imagen = dir_movielens_images + "/" + String(idPelicula) + ".jpg"
    if (fs.existsSync(path_imagen)) {
        path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/" + String(idPelicula) + ".jpg"
    }
    else {
        path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/no_existe.png"
    }

    return res.json({
        id_pelicula: idPelicula,
        nombre_pelicula: nombrePelicula,
        tipo_pelicula: tipoPelicula,
        imagen: path_imagen
    })
})

app.get("/obtener-item", async (req, res) => {
    const id_usuario = req.query.id_usuario
    let idPelicula = Math.floor(Math.random() * 3952) + 1
    let nombrePelicula
    let tipoPelicula
    let peliculas = []
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(id_usuario) })

        let isIdFound = true

        while (isIdFound) {
            isIdFound = usuario.calificaciones.some(item => item.id_item === String(idPelicula))
        }

        //leer fichero de peliculas: titulo, año, etc...
        var data2 = fs.readFileSync(dir_movies_names, "utf-8")
        data2 = data2.split("\n")
        for (let pelicula = 0; pelicula < data2.length; pelicula++) {
            if (data2[pelicula].split("::")[0] === String(idPelicula)) {
                nombrePelicula = data2[pelicula].split("::")[1]
                tipoPelicula = data2[pelicula].split("::")[2]
                break
            }
        }

        let path_imagen = dir_movielens_images + "/" + String(idPelicula) + ".jpg"
        if (fs.existsSync(path_imagen)) {
            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/" + String(idPelicula) + ".jpg"
        }
        else {
            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/no_existe.png"
        }

        return res.json({
            id_pelicula: idPelicula,
            nombre_pelicula: nombrePelicula,
            tipo_pelicula: tipoPelicula,
            imagen: path_imagen
        })
    }
    catch (error) {
        console.log(error)
    }

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
        fs.appendFileSync(dir_ratings + "/" + String(id_usuario), linea, "utf-8")
        return res.json({
            estado: "agregado"
        })
    }
    catch (error) {
        console.log(error)
    }
})

app.post("/calificar-item", async (req, res) => {
    try {
        //fs.appendFileSync(ratingsUsuariosDir+"/"+String(id_usuario), linea, "utf-8")
        //escribir en el archivo las calificaciones
        let rating_usuario = req.body
        let id_usuario = String(rating_usuario.id_usuario)
        let id_item = String(rating_usuario.id_item)
        let rating_item = String(rating_usuario.rating)
        let numb = Math.floor(Math.random() * 978300760) + 1
        let linea = id_usuario + "::" + id_item + "::" + rating_item + "::" + String(numb) + "\n"

        const client = await MongoClient.connect(url)
        const db = client.db(dbName)

        const item_calificado = {
            id_item: id_item,
            linea: linea
        }

        await db.collection("usuarios").updateOne(
            { _id: new ObjectId(rating_usuario.id_usuario) },
            { $addToSet: { calificaciones: item_calificado } }
        )
        return res.json({
            estado: "agregado"
        })
    }
    catch (error) {
        console.log(error)
    }
})

app.post("/enviar-al-stack", async (req, res) => {
    const idGrupo = req.body.idGrupo
    const idUsuario = req.body.idUsuario
    const idItem = req.body.idItem
        let path_imagen = dir_movielens_images + "/" + String(idItem) + ".jpg"
        if (fs.existsSync(path_imagen)) {
            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/" + String(idItem) + ".jpg"
        }
        else {
            path_imagen = "http://" + server_ip + ":" + server_port + movielens_images + "/no_existe.png"
        }
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        await db.collection("salas").updateOne(
            { _id: new ObjectId(idGrupo), "recomendaciones_stack.id_usuario": idUsuario },
            { $addToSet: { "recomendaciones_stack.$.items": { idItem: idItem, pathImagen: path_imagen } } }
        )
        return res.json({
            resp: "agregado"
        })
    }
    catch (error) {
        console.log(error)
        return res.json({
            resp: "error"
        })
    }
})

app.get("/obtener-stack-usuario", async (req, resp) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne(
            { _id: new ObjectId(req.query.idGrupo) }
        )
        const usuarioStack = sala.recomendaciones_stack.find(obj => obj.id_usuario === req.query.idUsuario)
        if (usuarioStack) {
            return resp.json({
                items: usuarioStack.items
            })
        }
        return resp.json({
            items: {}
        })
    }
    catch (error) {
        console.log(error)
        return resp.json({
            items: "error"
        })
    }
})

app.delete("/eliminar-fichero", async (req, res) => {
    let usuario_idSesion = req.body?.id_sesion
    if (usuario_idSesion !== undefined) {
        try {
            const client = await MongoClient.connect(url);
            const db = client.db(dbName);
            const usuario = await db.collection("sala").doc(usuario_idSesion).get()
            const usuario_numero = usuario?.data()?.numero_usuario
            if (usuario_numero !== undefined) {
                fs.unlinkSync(dir_ratings + "/" + String(usuario_numero))
                return res.json({
                    estado: "eliminado"
                })
            }
        } catch (error) {
            console.log(error)
            return res.json({
                estado: "no existe o ya fue eliminado"
            })
        }
    }
})

server.listen(8000)

console.log("Servidor iniciado en puerto 8000")
