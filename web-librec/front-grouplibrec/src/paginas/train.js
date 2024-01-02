import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { useNavigate, useParams, Link } from "react-router-dom"
import axios from "axios"
import Calificar from "./calificar"
import Chat from "../componentes/Chat.js"
import TarjetaRecomendaciones from "../componentes/TarjetaRecomendaciones"
import TarjetaUsuario from "../componentes/TarjetaUsuario"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket, faPeopleGroup, faStar, faUser, faFlagCheckered } from "@fortawesome/free-solid-svg-icons"
import PanelFavoritos from "../componentes/PanelFavoritos"
import { useTranslation } from "react-i18next"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const TrainningRoom = () => {
    const { t, i18n } = useTranslation("paginas/grupo")

    const idGrupo = useParams().id
    const navigate = useNavigate()
    const [idUsuario, setIdUsuario] = useState(sessionStorage.getItem("id_usuario"))
    const [idSesion, setIdSesion] = useState(sessionStorage.getItem("id_sesion"))
    const [idSala, setIdSala] = useState()
    const [usuarioSesion, setUsuarioSesion] = useState({})
    const [usuariosSesion, setUsuariosSesion] = useState([])
    const [calificacionesEstado, setCalificacionesEstado] = useState(false)
    const [emitirSignal, setEmitirSignal] = useState(0)
    const [recomendacionesIndividuales, setRecomendacionesIndividuales] = useState([])
    const [recomendacionesGrupales, setRecomendacionesGrupales] = useState([])
    const [cargandoGrupo, setCargandoGrupo] = useState(false)
    const [cargandoIndividual, setCargandoIndividual] = useState(false)
    const [liderGrupo, setLiderGrupo] = useState({ id_lider: null, usuario_lider: null })
    const [stackUsuario, setStackUsuario] = useState([])
    const userJoinedRef = useRef(false)
    const obtenerUsuarioRef = useRef(false)

    const stylePagina = {
        margin: "20px",
    }

    const activarCalificaciones = () => {
        setCalificacionesEstado(true)
    }

    // revisar si el usuario tiene sesion
    useEffect(() => {
        if (sessionStorage.getItem("id_sesion") !== null) {
            setIdSesion(sessionStorage.getItem("id_sesion"))
            setIdUsuario(sessionStorage.getItem("id_usuario"))
            sessionStorage.setItem("id_sala", idGrupo)
            setIdSala(sessionStorage.getItem("id_sala"))
        }
        else {
            navigate("/ingresar", { replace: true })
        }
    }, [])

    useEffect(() => {
        if (userJoinedRef.current) return
        userJoinedRef.current = true
        mostrarIngreso()
    }, [])

    // obtener usuario 
    useEffect(() => {
        const obtenerUsuario = async () => {
            if (obtenerUsuarioRef.current) return
            obtenerUsuarioRef.current = true
            if (typeof idUsuario === 'string') {
                try {
                    const usuario = await api.get("/obtener-usuario", { params: { idUsuario } }, {
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                    if (usuario) {
                        setUsuarioSesion(usuario.data)
                    }
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
        obtenerUsuario()
    }, [idUsuario])

    // obtener sala
    useEffect(() => {
        const obtenerSalaGrupo = async () => {
            try {
                const sala = await api.get("/obtener-sala-lider", { params: { idGrupo } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (sala) {
                    const lider_grupo = {
                        ...liderGrupo,
                        id_lider: sala.data.user._id,
                        usuario_lider: sala.data.user.usuario,
                        titulo: sala.data.titulo
                    }
                    setLiderGrupo(lider_grupo)
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        obtenerSalaGrupo()
    }, [])

    // Obtener usuarios del grupo cuando alguien se une a la sala
    useEffect( () => {
        const obtenerUsuarios = async () => {
            try {
                const resp_grupo = await api.get("/obtener-usuarios-grupo", { params: { idGrupo } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (resp_grupo) {
                    setUsuariosSesion(resp_grupo.data)
                }
            }
            catch (error) {
                console.log("Error al obtener usuarios")
            }
        }
        obtenerUsuarios()
    }, [])

    const mostrarIngreso = async () => {
        try {
            const tiempo_actual = Date.now()
            let info = {
                "idGrupo": idGrupo,
                "id_usuario": idUsuario,
                "texto": "Recomiendo esto",
                "timestamp": tiempo_actual,
                "tipo_mensaje": "ingreso_sala",
            }
            const enviar_req = await api.post("/enviar-mensaje-chat", (info), {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (enviar_req) {
                socket.emit("chat-enviar-mensaje", idGrupo)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    // señal cuando alguien se une al grupo
    useEffect(() => {
        socket.emit("entrar-sala", idGrupo, idSesion)
        setEmitirSignal(emitirSignal + 1)
    }, [])

    const salirGrupo = async () => {
        const tiempo_actual = Date.now()
        let info = {
            "idGrupo": idGrupo,
            "id_usuario": idUsuario,
            "texto": "salir sala",
            "timestamp": tiempo_actual,
            "tipo_mensaje": "salir_sala",
        }

        const salir_sala = await api.post("/enviar-mensaje-chat", (info), {
            headers: {
                "Content-type": "application/json"
            }
        })
        if (salir_sala) {
            sessionStorage.removeItem("id_sala")
            socket.emit("chat-enviar-mensaje", idGrupo)
            socket.emit("salir-sala", idGrupo, idSesion)
            setEmitirSignal(emitirSignal + 1)

        }
    }

    // obtener recomendaciones grupales tiempo real
    socket.on("mostrar-grupo-recomendaciones", async (recomendacion_grupo) => {
        setRecomendacionesGrupales(recomendacion_grupo)
    })

    socket.on("cargando", (valor) => {
        setCargandoGrupo(valor)
    })

    const ejecutarRecomendacionGrupo = async () => {
        setCargandoGrupo(true)
        socket.emit("cargando-enviar", idGrupo, true)
        try {
            const recomendacion_grupal = await api.get("/ejecutar-recomendacion-grupal", { params: { idGrupo } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (recomendacion_grupal) {
                setCargandoGrupo(false)
                socket.emit("cargando-enviar", idGrupo, false)
                socket.emit("enviar-grupo-recomendaciones", idGrupo, recomendacion_grupal.data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const ejecutarRecomendacionIndividual = async () => {
        setCargandoIndividual(true)
        try {
            const recomendacion_individual = await api.get("/ejecutar-recomendacion-individualv2", { params: { idUsuario, idGrupo } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (recomendacion_individual) {
                setCargandoIndividual(false)
                setRecomendacionesIndividuales(recomendacion_individual.data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const enviarAlStack = async (idItem) => {
        const itemStack = {
            idGrupo: idGrupo,
            idUsuario: idUsuario,
            idItem: idItem
        }
        const eventoFavoritos = {
            idSala: idGrupo,
            idUsuario: idUsuario,
            evento: "favoritos"
        }
        try {
            const resp = await api.post("/enviar-a-favoritos", itemStack, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (resp.data.respuesta === "agregado") {
                const tiempo_actual = Date.now()
                let info = {
                    "idGrupo": idGrupo,
                    "id_usuario": idUsuario,
                    "texto": "Enviar a favoritos",
                    "timestamp": tiempo_actual,
                    "tipo_mensaje": "enviar_favoritos",
                    "itemId": idItem
                }

                const mensaje_add_favoritos = await api.post("/enviar-mensaje-chat", (info), {
                    headers: {
                        "Content-type": "application/json"
                    }
                })

                if (mensaje_add_favoritos) {
                    socket.emit("enviar-a-favoritos", (idGrupo))
                    socket.emit("chat-enviar-mensaje", idGrupo)
                }
            }
            else if (resp.data.respuesta === "no_agregado") {
                window.alert(`${t('main.alert.maxFavorites', { max: resp.data.maxFavoritos })}`)
            }
            const enviar_evento = await api.post("/evento-usuario", (eventoFavoritos), {
                headers: {
                    "Content-type": "application/json"
                }
            })
            //obtenerStackUsuario(idGrupo, idUsuario)
        }
        catch (error) {
            console.log(error)
        }
    }

    const verificarCalificacionesFavoritos = async (e) => {
        try {
            const verificar = await api.get("/verificar-calificaciones-favoritos", {
                params: { idGrupo, idUsuario },
                headers: {
                    "Content-type": "application/json"
                }
            })
            const tiempo_actual = Date.now()
            let info = {
                "idGrupo": idGrupo,
                "id_usuario": idUsuario,
                "texto": "Entrar sala espera",
                "timestamp": tiempo_actual,
                "tipo_mensaje": "sala_espera",
            }

            const sala_espera = await api.post("/enviar-mensaje-chat", (info), {
                headers: {
                    "Content-type": "application/json"
                }
            })

            if(sala_espera){
                socket.emit("chat-enviar-mensaje", idGrupo)
            }

            if (verificar.data.respuesta === "stop" && sala_espera) {
                window.alert(`${t('main.alert.consensus', { max: verificar.data.maxFavoritos })}`)
            } else {
                // Condition is met, navigate to the specified URL
                navigate(`/sala-espera/${idGrupo}`);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div style={stylePagina}>
            <div className="columns" style={{ border: "1px solid #000", borderRadius: 5 }} >
                <div className="column">
                    <p className="is-size-1 has-text-centered">{t('main.roomName', { titleRoom: liderGrupo.titulo, leaderName: liderGrupo.usuario_lider })}</p>
                </div>
            </div>
            <div className="columns">
                {/* Usuarios */}
                <div className="column is-one-fifth">
                    <p className="is-size-1 has-text-centered">{t('main.users.connected')}</p>
                    <div className="box" style={{ border: "1px solid #000" }}>
                        <TarjetaUsuario usuario={usuarioSesion} liderGrupo={liderGrupo} />
                    </div>
                    {
                        Object.values(usuariosSesion).map((usuario, index) => {
                            if (usuario._id !== sessionStorage.getItem("id_usuario")) {
                                return (
                                    <div className="box" key={index + "" + usuario.id_sesion} style={{ border: "1px solid #000" }} >
                                        <TarjetaUsuario usuario={usuario} liderGrupo={liderGrupo} />
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                {/* Recomendaciones */}
                <div className="column">
                    {/* Recomendaciones individuales */}
                    <TarjetaRecomendaciones socket={socket} idUsuario={idUsuario} idGrupo={idGrupo} tipoRecomendacion="individual" recomendaciones={recomendacionesIndividuales} cargando={cargandoIndividual} enviarAlStack={enviarAlStack} />
                </div>
                <div className="column">
                    {/* Recomendaciones grupales */}
                    <TarjetaRecomendaciones socket={socket} idUsuario={idUsuario} idGrupo={idGrupo} tipoRecomendacion="grupal" recomendaciones={recomendacionesGrupales} cargando={cargandoGrupo} enviarAlStack={enviarAlStack} />
                </div>
                <div className="column">
                    { /* Chat Grupal */}
                    <div className="columns">
                        <div className="column">
                            <Chat socket={socket} api={api} idGrupo={idGrupo} liderGrupo={liderGrupo} enviarAlStack={enviarAlStack} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Botones importantes */}
            <div className="columns has-text-centered">
                <div className="column">
                    <button className="button is-info is-large is-rounded" onClick={activarCalificaciones}>
                        <FontAwesomeIcon icon={faStar} />
                    </button>
                </div>
                <div className="column">
                    <button className="button is-primary is-large is-rounded" onClick={ejecutarRecomendacionIndividual}>
                        <FontAwesomeIcon icon={faUser} />
                    </button>
                </div>
                { /* Recomendación Grupal solo líder */
                    liderGrupo.id_lider === idUsuario &&
                    <div className="column">
                        <button className="button is-primary is-large is-rounded" onClick={ejecutarRecomendacionGrupo}>
                            <FontAwesomeIcon icon={faPeopleGroup} />
                        </button>
                    </div>
                }
                <div className="column">
                    <Link to="/salas">
                        <button className="button is-warning is-large is-right is-rounded" onClick={salirGrupo}>
                            <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        </button>
                    </Link>
                </div>
            </div>
            <Calificar estado={calificacionesEstado} cambiarEstado={setCalificacionesEstado} idUsuario={idUsuario} />
            <div className="columns has-text-centered">
                <div className="column">
                    <PanelFavoritos socket={socket} idUsuario={idUsuario} idGrupo={idGrupo} />
                </div>
                {
                    /*
                <div className="column">
                    <button className="button is-primary is-large is-rounded is-light" onClick={verificarCalificacionesFavoritos}>
                        <FontAwesomeIcon icon={faFlagCheckered} style={{ color: "#358e33", }} />
                    </button>
                </div>
                    */
                }
            </div>
        </div>
    )
}

export default TrainningRoom