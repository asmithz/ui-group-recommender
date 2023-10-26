import 'dotenv/config'
import express from "express"
import { Server as socketServer } from "socket.io"
import http from "http"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import child_process from 'child_process'
import fileUpload from 'express-fileupload'
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
const dir_recommendations_dataset_users_lastfm = process.env.DIR_RECOMMENDATIONS_DATASET_USERS_DATA_LASTFM
const user_recomendations_properties = process.env.USER_RECOMMENDATIONS_PROPERTIES
const group_recomendations_properties = process.env.GROUP_RECOMMENDATIONS_PROPERTIES
const recommendations_results_users = process.env.RECOMMENDATIONS_RESULTS_USERS
const dir_movielens_images = process.env.DIR_MOVIELENS_IMAGES
const dir_lastfm_images = process.env.DIR_LASTFM_IMAGES
const dir_recommendations_rooms = process.env.DIR_RECOMMENDATIONS_ROOMS
const dir_recommendations_results = process.env.DIR_RECOMMENDATIONS_RESULTS
const dir_ratings = process.env.DIR_RATINGS
const dir_movies_names = process.env.DIR_MOVIES_IMAGES
const dir_artists_data = process.env.DIR_ARTISTS_DATA
const dir_tracks_data = process.env.DIR_TRACKS_DATA
const dir_icons_users = process.env.DIR_ICONS_USERS
const movielens_images = process.env.MOVIELENS_IMAGES
const lastfm_images = process.env.LASTFM_IMAGES
const dir_icons = process.env.DIR_ICONS
const db_url = process.env.DB_URL
const db_name = process.env.DB_NAME

const socket_port = process.env.SOCKET_PORT
const server_port = process.env.SERVER_PORT

io.attach(socket_port)

app.use(cors())
app.use(express.json())
app.use(movielens_images, express.static("imagenes-movielens"))
app.use(lastfm_images, express.static("imagenes-lastfm"))
app.use(dir_icons, express.static("iconos"))
app.use(fileUpload())

const url = db_url
const dbName = db_name

const maxFavoritos = 10

// socket
// cuando los usuarios se conectan
io.on("connection", (socket) => {
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    })
    // Se envia un socket.id a la interfaz login
    socket.emit("sesion-usuario", (socket.id))
    // Genera la sesion del usuario cuando ingresa: su socket.id y id.usuario
    socket.on("generar-sesion", async (usuarioId) => {
        try {
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            await db.collection("sesiones").insertOne({ "id_sesion": socket.id, "id_usuario": usuarioId })
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
                if (user) {
                    socket.join(idGrupo)
                    io.in(idGrupo).emit("update-grupo")
                    const userGrupo = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo), usuarios_activos: { $elemMatch: { _id: new ObjectId(user._id) } } })
                    // si no esta en el grupo agregarlo
                    if (!userGrupo) {
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
                        await db.collection("usuarios").updateOne(
                            { _id: user._id },
                            {
                                $set: { idSalaActiva: idGrupo }
                            }
                        )
                        // añadir usuario a sala eventos
                        const userEvento = await db.collection("salas_eventos").findOne({ id_sala: idGrupo, usuarios: { $elemMatch: { id_usuario: sesion_usuario.id_usuario } } })
                        if (!userEvento) {
                            await db.collection("salas_eventos").updateOne(
                                { id_sala: idGrupo },
                                {
                                    $addToSet: {
                                        usuarios: {
                                            id_usuario: sesion_usuario.id_usuario,
                                            score: {
                                                vistos: 0,
                                                recomendados: 0,
                                                favoritos: 0,
                                                escuchados: 0
                                            }
                                        }
                                    }
                                }
                            )
                        }
                    }
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
                const userGrupo = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo), usuarios_activos: { $elemMatch: { _id: new ObjectId(user._id) } } })
                if (userGrupo) {
                    await db.collection("usuarios").updateOne(
                        { _id: new ObjectId(sesion_usuario.id_usuario) },
                        {
                            $set: { idSalaActiva: "" }
                        }
                    )
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

    // entrar sala espera
    socket.on("entrar-sala-espera", async (idSala, idSesion) => {
        try {
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            const sesion_usuario = await db.collection("sesiones").findOne({ id_sesion: idSesion })
            if (sesion_usuario) {
                const user = await db.collection("usuarios").findOne({ _id: new ObjectId(sesion_usuario.id_usuario) })
                if (user) {
                    socket.join(idSala + "espera")
                    io.in(idSala + "espera").emit("update-sala-espera")
                    const userGrupo = await db.collection("salas").findOne({ _id: new ObjectId(idSala), sala_espera: { $elemMatch: { _id: new ObjectId(user._id) } } })
                    // si no esta en el grupo agregarlo
                    if (!userGrupo) {
                        await db.collection("salas").updateOne(
                            { _id: new ObjectId(idSala) },
                            { $addToSet: { sala_espera: user } }
                        )
                    }
                }
            }
        }
        catch (error) {
            console.log(error)
        }
    })

    // si se desconecta el usuario
    socket.on("disconnect", async () => {
        try {
            const salas_creadas = io.of("/").adapter.rooms
            for (const [idSala, socket_sala_id] of salas_creadas) {
                if (socket_sala_id.has(socket.id)) {
                    socket.leave(idSala)
                }
            }
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            const sesion_usuario = await db.collection("sesiones").findOne({ id_sesion: socket.id })
            if (sesion_usuario) {
                const user = await db.collection("usuarios").findOne({ _id: new ObjectId(sesion_usuario.id_usuario) })
                if (user) {
                    const idGrupo = user.idSalaActiva
                    const userGrupo = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo), usuarios_activos: { $elemMatch: { _id: new ObjectId(user._id) } } })
                    if (userGrupo) {
                        await db.collection("salas").updateOne(
                            { _id: userGrupo._id },
                            {
                                $pull:
                                    { usuarios_activos: { _id: new ObjectId(user._id) } }
                            }
                        )
                        await db.collection("usuarios").updateOne(
                            { _id: new ObjectId(sesion_usuario.id_usuario) },
                            {
                                $set: { idSalaActiva: "" }
                            }
                        )
                    }
                }
            }

        }
        catch (error) {
            console.log(error)
        }
    })
    // cambiar de pagina y mostrar item final
    socket.on("solicitar-pagina-final", (idSala) => {
        io.in(idSala + "espera").emit("mostrar-pagina-final")
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

    // favoritos
    socket.on("enviar-a-favoritos", (idGrupo) => {
        io.in(idGrupo + "favoritos").emit("obtener-favoritos")
    })
    socket.on("entrar-panel-favoritos", (idGrupo) => {
        socket.join(idGrupo + "favoritos")
    })
    socket.on("eliminar-favorito-grupo", async (idGrupo, idItem) => {
        try {
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)
            await db.collection("salas").updateOne(
                {
                    _id: new ObjectId(idGrupo)
                },
                {
                    $pull: {
                        "recomendaciones_favoritos": {
                            idItem: idItem
                        }
                    }
                }
            )
            client.close()
            io.in(idGrupo + "favoritos").emit("obtener-favoritos")
        }
        catch (error) {
            console.log(error)
        }
    })

})

//apis
app.post("/registrar-usuario", async (req, res) => {
    if (!req.files || !req.files.imagen_usuario) {
        res.status(400).json({ error: 'No file uploaded' })
        return
    }
    const image = req.files.imagen_usuario
    const uploadDirectory = dir_icons_users
    const filePath = uploadDirectory + "/" + image.name;
    image.mv(filePath, async (err) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Failed to upload file' })
        } else {
            let usuario = {
                usuario: req.body.usuario,
                nombre: req.body.nombre,
                edad: req.body.edad,
                educacion: req.body.educacion,
                password: req.body.password,
                recomendaciones: [],
                imagen_usuario: "http://" + server_ip + ":" + server_port + dir_icons + "/" + image.name,
                calificaciones: [],
                idSalaActiva: ""
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
        }
        return res.json(req.body)
    })
})

app.get("/obtener-sesion-usuario", async (req, res) => {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const usuario_sesion = await db.collection("sesiones").findOne({ "id_usuario": req.query.idUsuario });
        client.close()
        if (usuario_sesion) {
            return res.json({
                "idSesion": usuario_sesion.id_sesion
            })
        }
        return res.json({ error: "usuario sin sesion" })
    }
    catch (error) {
        console.log(error)
    }
})

app.post("/login-usuario", async (req, res) => {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const usuario = await db.collection("usuarios").findOne({ "usuario": req.body.usuario });
        client.close();
        let test
        if (usuario) {
            if (usuario.password === req.body.password) {
                const personalidad = await db.collection("personalidades").findOne({ idUsuario: usuario._id.toString() })
                if (personalidad === null) {
                    test = "si"
                }
                else {
                    test = "no"
                }
                return res.json({ "respuesta": "ingreso", "usuario_id": usuario._id.toString(), "test": test })
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
    let idSalaEventos = new ObjectId()
    let sala = {
        _id: idSalaEventos,
        id_sala: req.body.id_sala,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        lider: req.body.lider,
        usuarios_activos: [],
        chat: [],
        recomendaciones_grupal: [],
        recomendaciones_individual: [],
        recomendaciones_stack: [],
        recomendaciones_favoritos: [],
        sala_espera: [],
        sala_eventos_id: idSalaEventos.toString()
    }
    let sala_eventos = {
        id_sala: idSalaEventos.toString(),
        usuarios: []
    }
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        await db.collection("salas").insertOne(sala)
        await db.collection("salas_eventos").insertOne(sala_eventos)
        client.close()
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
        client.close()
        return res.json(salas)
    }
    catch (error) {
        console.log(error)
        return res.json("error")
    }
})

// Check if a document exists in a collection
app.get("/check-usuario", async (req, res) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("sala").findOne({ _id: req.body.id_sesion })
        client.close()
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
        client.close()
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
        client.close()
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
        client.close()
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
        client.close()
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
        client.close()
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
                let path_imagen = dir_lastfm_images + "/" + String(req.body.itemId) + ".jpg"
                if (fs.existsSync(path_imagen)) {
                    path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(req.body.itemId) + ".jpg"
                }
                else {
                    path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
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
            else if (req.body.tipo_mensaje === "ingreso_sala") {
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    "texto": req.body.texto,
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "ingreso_sala"
                }
            }
            else if (req.body.tipo_mensaje === "rec_usuario") {
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    item: req.body.item,
                    "texto": "El usuario " + n_usuario.usuario + " te ha recomendado ",
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "rec_usuario",
                    "usuarioDestinoID": req.body.usuarioDestinoID,
                    "usuarioDestino": req.body.usuarioDestino
                }
            }
            else if (req.body.tipo_mensaje === "rec_grupal") {
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    item: req.body.item,
                    "texto": "El usuario " + n_usuario.usuario + " recomienda  ",
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "rec_grupal",
                    "grupoDestino": req.body.grupoDestino
                }
            }
            else if (req.body.tipo_mensaje === "enviar_favoritos") {
                const item = await db.collection("tracks").findOne({ track_id: parseInt(req.body.itemId) })
                let path_imagen = dir_lastfm_images + "/" + String(item.artist_id) + ".jpg"
                if (fs.existsSync(path_imagen)) {
                    path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(item.artist_id) + ".jpg"
                }
                else {
                    path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
                }
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    item: {
                        idGrupo: idSala,
                        idItem: item.track_id,
                        id_autor: item.artist_id,
                        nombreItem: item.track_name,
                        nombre_autor: item.artist_name,
                        tipoItem: item.track_category,
                        url_item: item.track_url,
                        url_autor: item.artist_url,
                        origin_autor: item.artist_country,
                        continent_autor: item.artist_continent,
                        pathItem: path_imagen
                    },
                    "texto": "El usuario " + n_usuario.usuario + " añadió a favoritos",
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "enviar_favoritos",
                }
            }
            else if (req.body.tipo_mensaje === "eliminar_favoritos") {
                const item = await db.collection("tracks").findOne({ track_id: parseInt(req.body.itemId) })
                let path_imagen = dir_lastfm_images + "/" + String(item.artist_id) + ".jpg"
                if (fs.existsSync(path_imagen)) {
                    path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(item.artist_id) + ".jpg"
                }
                else {
                    path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
                }
                info_mensaje = {
                    "id_usuario": req.body.id_usuario,
                    "usuario": n_usuario.usuario,
                    item: {
                        idGrupo: idSala,
                        idItem: item.track_id,
                        id_autor: item.artist_id,
                        nombreItem: item.track_name,
                        nombre_autor: item.artist_name,
                        tipoItem: item.track_category,
                        url_item: item.track_url,
                        url_autor: item.artist_url,
                        origin_autor: item.artist_country,
                        continent_autor: item.artist_continent,
                        pathItem: path_imagen
                    },
                    "texto": "El usuario " + n_usuario.usuario + " quitó de favoritos",
                    "timestamp": req.body.timestamp,
                    "tipo_mensaje": "eliminar_favoritos",
                }
            }
            const nuevo_mensaje = await db.collection("salas").updateOne(
                { _id: new ObjectId(idSala) },
                { $push: { chat: info_mensaje } }
            )
            client.close()
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
            // fecha recomendacion
            const tiempo_actual = Date.now()

            // crear directorio del usuario si no existe
            const directorioUsuario = dir_recommendations_users + "/" + idUsuario
            const directorioDataUsuario = directorioUsuario + "/data"

            if (!fs.existsSync(directorioUsuario)) {
                fs.mkdirSync(directorioUsuario)
            }
            if (!fs.existsSync(directorioDataUsuario)) {
                fs.mkdirSync(directorioDataUsuario)
            }
            //const userData = directorioDataUsuario + "/user_data"

            const userData = directorioDataUsuario + "/users_data_lastfm"

            // crear y/o reiniciar dataset del usuario
            fs.copyFileSync(dir_recommendations_dataset_users_lastfm, userData)

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
            const dataInputPathName = "users_data_lastfm" + "\n"
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
            grouplibrec.on("close", async (code) => {
                if (code === 0) {
                    // devolver items recomendados para el grupo
                    console.log(`exit success: ${code}`)
                    const directorioResultadosSala = recommendations_results_users + "/" + idGrupo + "/" + idUsuario + "/"
                    let items = []
                    const recomendaciones = fs.readdirSync(directorioResultadosSala)
                    const directorioUltimaRecomendacion = recomendaciones.sort()[recomendaciones.length - 1]
                    let trecomendaciones = fs.readFileSync(directorioResultadosSala + directorioUltimaRecomendacion + "/recommendations.txt", "utf-8")
                    let arrayRecomendaciones = trecomendaciones.split("\n")

                    //var data2 = fs.readFileSync(dir_tracks_data, "utf-8")
                    //data2 = data2.split("\n")

                    for (let i = 0; i < arrayRecomendaciones.length - 1; i++) {
                        let recomendacion = arrayRecomendaciones[i].split(",");
                        let grupo = recomendacion[0];
                        let item = parseInt(recomendacion[1]);
                        let rating_individual = recomendacion[2];

                        let found_item = await db.collection("tracks").findOne({ track_id: parseInt(item) })

                        let trackItemId = found_item.track_id
                        let nombreItem = found_item.track_name
                        let tipoItem = found_item.track_category
                        let url_item = found_item.track_url
                        let idAutor = found_item.artist_id
                        let nombreAutor = found_item.artist_name
                        let urlAutor = found_item.artist_url
                        let originAutor = found_item.artist_country
                        let continentAutor = found_item.artist_continent

                        let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg";
                        if (fs.existsSync(path_imagen)) {
                            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg";
                        } else {
                            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png";
                        }
                        items.push({
                            idItem: String(item),
                            rating: rating_individual,
                            pathImagen: path_imagen,
                            pathItem: path_imagen,
                            nombreItem: nombreItem,
                            tipoItem: tipoItem,
                            url_item: url_item,
                            id_autor: idAutor,
                            nombre_autor: nombreAutor,
                            url_autor: urlAutor,
                            origin_autor: originAutor,
                            continent_autor: continentAutor,
                        });
                    }
                    let items_ordenados = items.sort(function (a, b) {
                        return b.ratingGrupo - a.ratingGrupo
                    })

                    await db.collection("usuarios").updateOne(
                        { _id: new ObjectId(idUsuario) },
                        {
                            $push:
                            {
                                recomendaciones:
                                    { idSala: idGrupo, time: tiempo_actual, items: items_ordenados }
                            }
                        }
                    )
                    client.close()
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
            // fecha recomendacion
            const tiempo_actual = Date.now()

            // crear directorio del grupo si no existe
            const directorioGrupo = dir_recommendations_rooms + "/" + idSala
            const directorioDataGrupo = directorioGrupo + "/data"

            if (!fs.existsSync(directorioGrupo)) {
                fs.mkdirSync(directorioGrupo)
            }
            if (!fs.existsSync(directorioDataGrupo)) {
                fs.mkdirSync(directorioDataGrupo)
            }
            //const usersDataGroup = directorioDataGrupo + "/users_data"
            const usersDataGroup = directorioDataGrupo + "/users_data_lastfm"

            // crear y/o reiniciar dataset del grupo
            fs.copyFileSync(dir_recommendations_dataset_users_lastfm, usersDataGroup)

            // añadir calificaciones de usuarios al dataset
            sala.usuarios_activos.forEach(async (usuario) => {
                groupUsers.push(usuario._id.toString())
                const user = await db.collection("usuarios").findOne({ _id: new ObjectId(usuario._id.toString()) })
                user.calificaciones.forEach((calificacion) => {
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
            const dataInputPathName = "users_data_lastfm" + "\n"
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
            grouplibrec.on("close", async (code) => {
                if (code === 0) {
                    // devolver items recomendados para el grupo
                    console.log(`exit success: ${code}`)
                    const directorioResultadosSala = dir_recommendations_results + "/" + idSala + "/"
                    let items = []
                    const recomendaciones = fs.readdirSync(directorioResultadosSala)
                    const directorioUltimaRecomendacion = recomendaciones.sort()[recomendaciones.length - 1]
                    let trecomendaciones = fs.readFileSync(directorioResultadosSala + directorioUltimaRecomendacion + "/recommendations.txt", "utf-8")
                    let arrayRecomendaciones = trecomendaciones.split("\n")
                    for (let i = 0; i < arrayRecomendaciones.length - 1; i++) {
                        let recomendacion = arrayRecomendaciones[i].split(",")
                        let grupo = recomendacion[0]
                        let item = recomendacion[1]
                        let rating_grupo = recomendacion[2]
                        if (item) {
                            let found_item = await db.collection("tracks").findOne({ track_id: parseInt(item) })

                            let trackItemId = found_item.track_id
                            let nombreItem = found_item.track_name
                            let tipoItem = found_item.track_category
                            let url_item = found_item.track_url
                            let idAutor = found_item.artist_id
                            let nombreAutor = found_item.artist_name
                            let urlAutor = found_item.artist_url
                            let originAutor = found_item.artist_country
                            let continentAutor = found_item.artist_continent

                            let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg"
                            if (fs.existsSync(path_imagen)) {
                                path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg"
                            }
                            else {
                                path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
                            }

                            items.push({
                                idGrupo: grupo,
                                idItem: item,
                                rating: rating_grupo,
                                pathImagen: path_imagen,
                                pathItem: path_imagen,
                                nombreItem: nombreItem,
                                tipoItem: tipoItem,
                                url_item: url_item,
                                id_autor: idAutor,
                                nombre_autor: nombreAutor,
                                url_autor: urlAutor,
                                origin_autor: originAutor,
                                continent_autor: continentAutor,
                            })
                        }
                    }
                    let items_ordenados = items.sort(function (a, b) {
                        return b.ratingGrupo - a.ratingGrupo
                    })

                    await db.collection("salas").updateOne(
                        { _id: new ObjectId(idSala) },
                        {
                            $addToSet: {
                                recomendaciones_grupal: {
                                    time: tiempo_actual,
                                    items: items_ordenados
                                }
                            }
                        }
                    )
                    client.close()
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

app.get("/obtener-recomendaciones-usuario", async (req, res) => {
    const idUsuario = req.query.idUsuario
    const idSala = req.query.idSala
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(idUsuario) })
        client.close()
        if (usuario) {
            const recomendacionesUsuario = usuario.recomendaciones.filter((recomendacion) => {
                return recomendacion.idSala === idSala
            })

            if (recomendacionesUsuario.length > 0) {
                return res.json(recomendacionesUsuario)
            } else {
                return res.json({
                    error: "No recommendations found for the specified idSala.",
                })
            }
        }
        return res.json({
            error: "User not found.",
        });
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/obtener-recomendaciones-grupo", async (req, res) => {
    const idSala = req.query.idSala
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne({ _id: new ObjectId(idSala) })
        client.close()
        if (sala) {
            if (sala.recomendaciones_grupal.length > 0) {
                return res.json(sala.recomendaciones_grupal)
            }
            else {
                return res.json({
                    error: "No recommendations found for the specified idSala.",
                })
            }
        }
        return res.json({
            error: "Group not found.",
        })
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
        var data2 = fs.readFileSync(dir_tracks_data, "utf-8")
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

    let path_imagen = dir_lastfm_images + "/" + String(idPelicula) + ".jpg"
    if (fs.existsSync(path_imagen)) {
        path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idPelicula) + ".jpg"
    }
    else {
        path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
    }

    return res.json({
        id_pelicula: idPelicula,
        nombre_pelicula: nombrePelicula,
        tipo_pelicula: tipoPelicula,
        imagen: path_imagen
    })
})

app.get("/obtener-item", async (req, res) => {
    const idItem = req.query.idItem

    const client = await MongoClient.connect(url)
    const db = client.db(dbName)
    const item = await db.collection("tracks").findOne({ track_id: parseInt(idItem) })

    let idTrack = item.track_id
    let nombreItem = item.track_name
    let tipoItem = item.track_category
    let url_item = item.track_url
    let idAutor = item.artist_id
    let nombreAutor = item.artist_name
    let urlAutor = item.artist_url
    let originAutor = item.artist_country
    let continentAutor = item.artist_continent

    let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg"
    if (fs.existsSync(path_imagen)) {
        path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg"
    }
    else {
        path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
    }
    client.close()
    return res.json({
        idItem: idItem,
        nombreItem: nombreItem,
        tipoItem: tipoItem,
        pathItem: path_imagen,
        url_item: url_item,
        id_autor: idAutor,
        nombre_autor: nombreAutor,
        url_autor: urlAutor,
        origin_autor: originAutor,
        continent_autor: continentAutor,
        imagen: path_imagen,
    })



    //for (let item = 0; item < data2.length; item++) {
    //    if (data2[item].split(splitType)[0] === String(idItem)) {
    //        nombreItem = data2[item].split(splitType)[1]
    //        tipoItem = data2[item].split(splitType)[2]
    //        url_item = data2[item].split(splitType)[3]
    //        idAutor = data2[item].split(splitType)[6]
    //        let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg"
    //        if (fs.existsSync(path_imagen)) {
    //            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg"
    //        }
    //        else {
    //            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
    //        }
    //        return res.json({
    //            idItem: idItem,
    //            nombreItem: nombreItem,
    //            tipoItem: tipoItem,
    //            pathItem: path_imagen,
    //            url_item: url_item
    //        })
    //    }
    //}

    //return res.json({
    //    estado: "no hay items"
    //})

})

app.get("/obtener-item-no-calificado", async (req, res) => {
    const id_usuario = req.query.id_usuario
    const cant_data = 646153
    let idItem = Math.floor(Math.random() * cant_data) + 1
    let idTrack
    let nombreItem
    let tipoItem
    let urlItem
    let idAutor
    let nombreAutor
    let urlAutor
    let originAutor
    let continentAutor
    let splitType = ","
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(id_usuario) })

        let isIdFound = true

        while (isIdFound) {
            isIdFound = usuario.calificaciones.some(item => item.id_item === String(idItem))
        }

        const item = await db.collection("tracks").findOne({ track_id: idItem })

        idTrack = item.track_id
        nombreItem = item.track_name
        tipoItem = item.track_category
        urlItem = item.track_url
        idAutor = item.artist_id
        nombreAutor = item.artist_name
        urlAutor = item.artist_url
        originAutor = item.artist_country
        continentAutor = item.artist_continent

        ////leer fichero de tracks...
        //var data2 = fs.readFileSync(dir_tracks_data, "utf-8")
        //data2 = data2.split("\n")

        //let foundTrack = true;
        //let left = 0;
        //let right = data2.length - 1;

        //while (foundTrack) {
        //    const idItem = Math.floor(Math.random() * cant_data) + 1;
        //    let index = -1;

        //    while (left <= right) {
        //        const mid = Math.floor((left + right) / 2);
        //        const currentItem = parseInt(data2[mid].split(splitType)[0]);

        //        if (currentItem === idItem) {
        //            index = mid;
        //            break;
        //        } else if (currentItem < idItem) {
        //            left = mid + 1;
        //        } else {
        //            right = mid - 1;
        //        }
        //    }

        //    if (index !== -1) {
        //        const itemData = data2[index].split(splitType);
        //        idTrack = itemData[0];
        //        nombreItem = itemData[1];
        //        tipoItem = itemData[2];
        //        urlItem = itemData[3];
        //        idAutor = itemData[4];
        //        nombreAutor = itemData[5];
        //        urlAutor = itemData[6];
        //        originAutor = itemData[7];
        //        continentAutor = itemData[8];
        //        foundTrack = false;
        //    }

        //    // Reset left and right pointers for the next iteration
        //    left = 0;
        //    right = data2.length - 1;
        //}

        let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg"
        if (fs.existsSync(path_imagen)) {
            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg"
        }
        else {
            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
        }
        client.close()
        return res.json({
            id_pelicula: idItem,
            nombre_pelicula: nombreItem,
            tipo_pelicula: tipoItem,
            url_item: urlItem,
            id_autor: idAutor,
            nombre_autor: nombreAutor,
            url_autor: urlAutor,
            origin_autor: originAutor,
            continent_autor: continentAutor,
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
    //let linea = id_usuario + "::" + id_pelicula + "::" + rating_pelicula + "::" + String(numb) + "\n"
    let linea = id_usuario + "," + id_pelicula + "," + rating_pelicula + "," + String(numb) + "\n"
    try {
        fs.appendFileSync(dir_ratings + "/" + String(id_usuario), linea, "utf-8")
        client.close()
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
        //let numb = Math.floor(Math.random() * 978300760) + 1
        //let linea = id_usuario + "::" + id_item + "::" + rating_item + "::" + String(numb) + "\n"
        let linea = id_usuario + "," + id_item + "," + rating_item + "," + String(500) + "\n"

        const client = await MongoClient.connect(url)
        const db = client.db(dbName)

        const item_calificado = {
            id_item: id_item,
            linea: linea,
            rating: rating_item
        }

        const user = await db.collection("usuarios").findOne({
            _id: new ObjectId(rating_usuario.id_usuario),
            "calificaciones.id_item": id_item
        })

        if (user) {
            await db.collection("usuarios").updateOne(
                {
                    _id: new ObjectId(rating_usuario.id_usuario),
                    "calificaciones.id_item": id_item
                },
                {
                    $set: {
                        "calificaciones.$.linea": linea,
                        "calificaciones.$.rating": rating_item
                    }
                }
            )
        }
        else {
            await db.collection("usuarios").updateOne(
                { _id: new ObjectId(rating_usuario.id_usuario) },
                { $addToSet: { calificaciones: item_calificado } }
            )
        }

        //await db.collection("usuarios").updateOne(
        //    { _id: new ObjectId(rating_usuario.id_usuario) },
        //    { $addToSet: { calificaciones: item_calificado } }
        //)

        //await db.collection("usuarios").updateOne(
        //    {
        //        _id: new ObjectId(rating_usuario.id_usuario),
        //        "calificaciones.id_item": id_item // Check if an object with the same id_item exists
        //    },
        //    {
        //        $set: {
        //            "calificaciones.$.linea": linea,
        //            "calificaciones.$.rating": rating_item
        //        }
        //    }
        //)

        client.close()
        return res.json({
            estado: "agregado"
        })
    }
    catch (error) {
        console.log(error)
    }
})


app.get("/obtener-item-calificacion", async (req, res) => {
    try {
        let idUsuario = req.query.idUsuario
        let idItem = String(req.query.idItem)
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)

        const user = await db.collection("usuarios").findOne(
            {
                _id: new ObjectId(idUsuario),
                "calificaciones.id_item": idItem
            }
        )

        if (user) {
            const itemCalificado = user.calificaciones.find(item => item.id_item === idItem);
            if (itemCalificado) {
                return res.json({
                    item: itemCalificado
                })
            }
        }
        client.close();
    }
    catch (error) {
        console.log(error);
    }
})

app.post("/enviar-al-stack", async (req, res) => {
    const idGrupo = req.body.idGrupo
    const idUsuario = req.body.idUsuario
    const idItem = req.body.idItem
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const item = await db.collection("tracks").findOne({ track_id: parseInt(idItem) })
        let idTrack = item.track_id
        let nombreItem = item.track_name
        let tipoItem = item.track_category
        let urlItem = item.track_url
        let idAutor = item.artist_id
        let nombreAutor = item.artist_name
        let urlAutor = item.artist_url
        let originAutor = item.artist_country
        let continentAutor = item.artist_continent
        let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg"
        if (fs.existsSync(path_imagen)) {
            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg"
        }
        else {
            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
        }
        await db.collection("salas").updateOne(
            { _id: new ObjectId(idGrupo), "recomendaciones_stack.id_usuario": idUsuario },
            {
                $addToSet: {
                    "recomendaciones_stack.$.items": {
                        idItem: idItem,
                        pathImagen: path_imagen,
                        nombreItem: nombreItem,
                        tipoItem: tipoItem,
                        pathItem: path_imagen,
                        url_item: urlItem,
                        id_autor: idAutor,
                        nombre_autor: nombreAutor,
                        url_autor: urlAutor,
                        origin_autor: originAutor,
                        continent_autor: continentAutor,
                        imagen: path_imagen,
                    }
                }
            }
        )
        client.close()
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

app.delete("/eliminar-del-stack", async (req, resp) => {
    const idGrupo = req.body.idGrupo
    const idUsuario = req.body.idUsuario
    const idItem = req.body.idItem
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        await db.collection("salas").updateOne(
            {
                _id: new ObjectId(idGrupo),
                "recomendaciones_stack.id_usuario": idUsuario
            },
            {
                $pull: {
                    "recomendaciones_stack.$.items": {
                        idItem: idItem
                    }
                }
            }
        )
        const sala = await db.collection("salas").findOne(
            { _id: new ObjectId(idGrupo) }
        )
        const usuarioStack = sala.recomendaciones_stack.find(obj => obj.id_usuario === idUsuario)
        client.close()
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
    }
})

app.delete("/eliminar-de-favoritos", async (req, resp) => {
    const idGrupo = req.body.idGrupo
    const idUsuario = req.body.idUsuario
    const idItem = req.body.idItem
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        await db.collection("salas").updateOne(
            {
                _id: new ObjectId(idGrupo)
            },
            {
                $pull: {
                    "recomendaciones_favoritos": {
                        idItem: idItem
                    }
                }
            }
        )
        const sala = await db.collection("salas").findOne(
            { _id: new ObjectId(idGrupo) }
        )
        const salaFavoritos = sala.recomendaciones_favoritos
        client.close()
        if (salaFavoritos) {
            return resp.json({
                items: salaFavoritos.items
            })
        }
        return resp.json({
            items: {}
        })

    }
    catch (error) {
        console.log(error)
    }
})

app.post("/enviar-a-favoritos", async (req, res) => {
    const idGrupo = req.body.idGrupo
    const idUsuario = req.body.idUsuario
    const idItem = req.body.idItem
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const item = await db.collection("tracks").findOne({ track_id: parseInt(idItem) })
        let idTrack = item.track_id
        let nombreItem = item.track_name
        let tipoItem = item.track_category
        let urlItem = item.track_url
        let idAutor = item.artist_id
        let nombreAutor = item.artist_name
        let urlAutor = item.artist_url
        let originAutor = item.artist_country
        let continentAutor = item.artist_continent
        let path_imagen = dir_lastfm_images + "/" + String(idAutor) + ".jpg"
        if (fs.existsSync(path_imagen)) {
            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/" + String(idAutor) + ".jpg"
        }
        else {
            path_imagen = "http://" + server_ip + ":" + server_port + lastfm_images + "/no_existe.png"
        }
        const sala = await db.collection("salas").findOne({ _id: new ObjectId(idGrupo) })
        if (sala) {
            if (sala.recomendaciones_favoritos.length < maxFavoritos) {
                await db.collection("salas").updateOne(
                    { _id: new ObjectId(idGrupo) },
                    {
                        $addToSet: {
                            "recomendaciones_favoritos": {
                                idItem: idItem,
                                pathImagen: path_imagen,
                                nombreItem: nombreItem,
                                tipoItem: tipoItem,
                                pathItem: path_imagen,
                                url_item: urlItem,
                                id_autor: idAutor,
                                nombre_autor: nombreAutor,
                                url_autor: urlAutor,
                                origin_autor: originAutor,
                                continent_autor: continentAutor,
                                imagen: path_imagen,
                                recomendadoPor: idUsuario
                            }
                        }
                    }
                )
                client.close()
                return res.json({
                    respuesta: "agregado"
                })
            }
            else {
                client.close()
                return res.json({
                    respuesta: "no_agregado",
                    maxFavoritos: maxFavoritos
                })
            }
        }
        return res.json({
            respuesta: "no_hay_sala"
        })
    }
    catch (error) {
        console.log(error)
        return res.json({
            resp: "error"
        })
    }
})

app.get("/verificar-calificaciones-favoritos", async (req, resp) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne(
            { _id: new ObjectId(req.query.idGrupo) }
        )
        const usuario = await db.collection("usuarios").findOne(
            { _id: new ObjectId(req.query.idUsuario) }
        )
        client.close()
        const verificar = {
            todos_calificados: false,
            cantidad_calificados: false
        }
        if (sala && usuario) {
            // array con id's de los favoritos
            const favoritos_sala = sala.recomendaciones_favoritos.map(favorito => favorito)

            const no_calificados = []

            favoritos_sala.forEach(itemFavorito => {
                const checkItem = usuario.calificaciones.find(itemCalificado => itemCalificado.id_item === itemFavorito.idItem);
                if (!checkItem || checkItem.rating === undefined) {
                    no_calificados.push(itemFavorito.idItem);
                }
                else {
                    console.log(itemFavorito.idItem)
                }
            })
            console.log(no_calificados)

            /*
            // obtener los calificados del usuario
            favoritos_sala.forEach(itemFavorito => {
                if (!usuario.calificaciones.some(itemCalificado => itemCalificado.id_item === itemFavorito)) {
                    if (!itemFavorito.rating){
                        no_calificados.push(itemFavorito)
                    }
                }
            })
            */

            if (no_calificados.length === 0) {
                console.log("ninguno por calificar")
                verificar.todos_calificados = true
            }
            else {
                console.log("faltan calificar ", no_calificados)
            }

            if (sala.recomendaciones_favoritos.length === maxFavoritos) {
                console.log(`cantidad ${maxFavoritos} verificada`)
                verificar.cantidad_calificados = true
            }
            else {
                console.log("deben ser 10 items")
            }

            if (verificar.todos_calificados && verificar.cantidad_calificados) {
                return resp.json({
                    respuesta: "ok",
                    code: 1,
                    maxFavoritos: maxFavoritos
                })
            }

            return resp.json({
                respuesta: "stop",
                code: 0,
                maxFavoritos: maxFavoritos
            })
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/obtener-favoritos-sala", async (req, resp) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne(
            { _id: new ObjectId(req.query.idGrupo) }
        )
        const favoritosSala = sala.recomendaciones_favoritos
        client.close()
        if (favoritosSala) {
            return resp.json({
                items: favoritosSala
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


app.get("/obtener-stack-usuario", async (req, resp) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = await db.collection("salas").findOne(
            { _id: new ObjectId(req.query.idGrupo) }
        )
        const usuarioStack = sala.recomendaciones_stack.find(obj => obj.id_usuario === req.query.idUsuario)
        client.close()
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

app.get("/obtener-test-personalidad", async (req, resp) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const preguntas = await db.collection("FFM_Test").find({}).toArray()
        if (preguntas) {
            client.close()
            return resp.json({
                preguntas: preguntas
            })
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.post("/generar-personalidad", async (req, resp) => {
    try {
        const respuestas = req.body.respuestas
        const idUsuario = req.body.idUsuario
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        let extraversion = 0
        let empatia = 0
        let conciencia = 0
        let neuroticismo = 0
        let experiencia = 0
        respuestas.forEach(async item => {
            if (item.factor === 1) {
                extraversion += parseInt(item.respuesta)
            }
            else if (item.factor === 2) {
                empatia += parseInt(item.respuesta)
            }
            else if (item.factor === 3) {
                conciencia += parseInt(item.respuesta)
            }
            else if (item.factor === 4) {
                neuroticismo += parseInt(item.respuesta)
            }
            else if (item.factor === 5) {
                experiencia += parseInt(item.respuesta)
            }
        })
        let personalidad = {
            idUsuario: idUsuario,
            extraversion: extraversion,
            empatia: empatia,
            conciencia: conciencia,
            neuroticismo: neuroticismo,
            experiencia: experiencia
        }
        await db.collection("personalidades").insertOne(personalidad)
        client.close()
        return resp.json({
            ok: "si"
        })
    }
    catch (error) {
        console.log(error)
    }
})

app.post("/generar-perfil", async (req, res) => {
    try {
        let gustos = req.body.categories
        const idUsuario = req.body.idUsuario
        //const idUsuario = "64bdbbd13f30efcf1bde4e33"
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        //const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(idUsuario) })

        for (const genero in gustos) {
            if (gustos[genero]) {
                let nombre_perfil = "Profile_"
                switch (genero) {
                    case "metal":
                        nombre_perfil = nombre_perfil + "Metal"
                        break
                    case "electronica":
                        nombre_perfil = nombre_perfil + "Electronica"
                        break
                    case "rock":
                        nombre_perfil = nombre_perfil + "Rock"
                        break
                    case "jazz":
                        nombre_perfil = nombre_perfil + "Jazz"
                        break
                    case "country":
                        nombre_perfil = nombre_perfil + "Country"
                        break
                    case "folk":
                        nombre_perfil = nombre_perfil + "Folk"
                        break
                    case "funk":
                        nombre_perfil = nombre_perfil + "Funk"
                        break
                    case "blues":
                        nombre_perfil = nombre_perfil + "Blues"
                        break
                    case "rap":
                        nombre_perfil = nombre_perfil + "Rap"
                        break
                    case "soundtrack":
                        nombre_perfil = nombre_perfil + "Soundtrack"
                        break
                    case "espiritual":
                        nombre_perfil = nombre_perfil + "Espiritual"
                        break
                    case "alternativo":
                        nombre_perfil = nombre_perfil + "Alternativo"
                        break
                    case "pop":
                        nombre_perfil = nombre_perfil + "Pop"
                        break
                }
                var perfil = fs.readFileSync("/home/asmith/recomendaciones/profiles/" + nombre_perfil, "utf-8")
                let calificacion
                let arrayRecomendaciones = perfil.split("\n")
                for (let i = 0; i < arrayRecomendaciones.length - 1; i++) {
                    let track = arrayRecomendaciones[i].split(",")[0]
                    let rating = arrayRecomendaciones[i].split(",")[1]
                    let listen = arrayRecomendaciones[i].split(",")[2]
                    calificacion = idUsuario + "," + track + "," + rating + "," + listen + "\n"
                    let item_calificado = {
                        id_item: track,
                        linea: calificacion,
                        rating: rating
                    }
                    await db.collection("usuarios").updateOne(
                        { _id: new ObjectId(idUsuario) },
                        { $addToSet: { calificaciones: item_calificado } }
                    )
                }
            }
        }
        //var perfil = fs.readFileSync("/home/asmith/recomendaciones/profiles", "utf-8")
        //console.log(gustos, idUsuario)
        client.close()
        return res.json({
            ok: "ok"
        })
    }
    catch (error) {
        console.log(error)
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

app.delete("/vaciar-sala-espera", async (req, res) => {
    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName)
        const sala = { _id: new ObjectId(req.query.idSala) }
        const update = {
            $set: { sala_espera: [] }
        }
        await db.collection('salas').updateOne(sala, update)
        return res.json({
            status: "sala vaciada"
        })
    }
    catch (error) {
        console.log(error)
        return res.json({
            status: "sala no vaciada"
        })
    }
})

app.post("/evento-usuario", async (req, res) => {
    // Extract data from the request body
    let evento_tipo = req.body.evento; // "vistos", "recomendados", "favoritos", or "escuchados"
    let idSala = req.body.idSala;
    let idUsuario = req.body.idUsuario;

    try {
        const client = await MongoClient.connect(url);
        const db = client.db(dbName);

        // Use $elemMatch to find the specific user within the array
        const userQuery = { id_sala: idSala, "usuarios.id_usuario": idUsuario };

        // Fetch the current value of score for the user
        const userEvento = await db.collection("salas_eventos").findOne(userQuery);
        const currentUserScore = userEvento.usuarios.find(user => user.id_usuario === idUsuario).score[evento_tipo];

        // Calculate the new score value (you can adjust this logic as needed)
        let newScoreValue = currentUserScore + 1;

        // Build the update object
        let updateObj = {};
        updateObj[`usuarios.$.score.${evento_tipo}`] = newScoreValue;

        const result = await db.collection("salas_eventos").updateOne(userQuery, { $set: updateObj });

        client.close();
        if (result.matchedCount > 0) {
            // Update successful
            return res.json({
                "resp": `Updated ${evento_tipo} for user ${idUsuario} in sala ${idSala}`
            })
        } else {
            return res.json({
                "resp": `User not found in sala ${idSala}`
            })
        }

    } catch (error) {
        console.error(error);
    }
})

server.listen(8000)

console.log("Servidor iniciado en puerto 8000")