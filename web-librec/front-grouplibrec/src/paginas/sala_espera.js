import { useNavigate, useParams } from "react-router-dom"
import io from "socket.io-client"
import axios from "axios"
import { useState, useEffect } from "react"
import TarjetaUsuario from "../componentes/TarjetaUsuario"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const SalaEspera = () => {
    const { t, i18n } = useTranslation("paginas/sala_espera")

    const idSala = useParams().id
    const navigate = useNavigate()
    const [usuarioSesion, setUsuarioSesion] = useState({})
    const [usuariosSalaEspera, setSalaEspera] = useState([])
    const [usuariosSala, setSala] = useState([])
    const [idUsuario, setIdUsuario] = useState(sessionStorage.getItem("id_usuario"))
    const [idSesion, setIdSesion] = useState(sessionStorage.getItem("id_sesion"))
    const [emitirSignal, setEmitirSignal] = useState(0)
    const [liderGrupo, setLiderGrupo] = useState({ id_lider: null, usuario_lider: null })

    const stylePagina = {
        maxWidth: "500px",
    }

    const styleBoxUserNotReady = {
        border: "1px solid #000"
    }

    const styleBoxUserReady = {
        backgroundColor: "#a2fab1",
        border: "1px solid #000"
    }

    // obtener usuario 
    useEffect(() => {
        const obtenerUsuario = async () => {
            if (typeof idUsuario === 'string') {
                try {
                    const usuario = await api.get("/obtener-usuario", { params: { idUsuario } }, {
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                    setUsuarioSesion(usuario.data)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
        obtenerUsuario()
    }, [idUsuario])

    // revisar si el usuario tiene sesion
    useEffect(() => {
        if (sessionStorage.getItem("id_sesion") !== null) {
            setIdSesion(sessionStorage.getItem("id_sesion"))
            setIdUsuario(sessionStorage.getItem("id_usuario"))
        }
        else {
            navigate("/ingresar", { replace: true })
        }
    }, [])

    // obtener usuarios en la sala de espera
    useEffect(() => {
        socket.on("update-sala-espera", async () => {
            try {
                const idGrupo = idSala
                const sala = await api.get("/obtener-sala-espera", { params: { idGrupo } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (sala) {
                    setSala(sala.data.salaActiva)
                    setSalaEspera(sala.data.salaEspera)
                    const lider_grupo = {
                        ...liderGrupo,
                        id_lider: sala.data.user._id,
                        usuario_lider: sala.data.user.usuario
                    }
                    setLiderGrupo(lider_grupo)
                }
            }
            catch (error) {
                console.log("Error al obtener usuarios ", error)
            }
        })
        return () => {
            socket.off("update-sala-espera")
        }
    }, [])

    // señal cuando alguien se une a la sala de espera
    useEffect(() => {
        if (idSala && idSesion) {
            socket.emit("entrar-sala-espera", idSala, idSesion)
            setEmitirSignal(emitirSignal + 1)
        }
    }, [idSala, idSesion])

    const cambiarPaginaEncuesta = () => {
        if (idSala && idSesion) {
            sessionStorage.setItem("idSala", idSala)
            socket.emit("solicitar-pagina-final", (idSala))
        }
    }

    useEffect(() => {
        socket.on("mostrar-pagina-final", () => {
            const result = usuariosSalaEspera.every(obj1 => usuariosSala.some(obj2 => obj2._id === obj1._id));
            if (result) {
                navigate(`/encuesta-final/${idSala}`)
            }
            else {
                window.alert("Error")
            }
        })

        return () => {
            socket.off("mostrar-pagina-final")
        }
    }, [])


    return (
        <div className="container mt-6" style={stylePagina}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-1 has-text-centered">{t('main.title')}</p>
                </div>
            </div>
            {/* Usuarios */}
            <p className="is-size-3 has-text-centered">{t('main.usersReady', { waiting: usuariosSalaEspera.length, total: usuariosSala.length })}</p>
            <div className="box" style={styleBoxUserReady}>
                <div className="columns">
                    <div className="column is-one-quarter" style={{ display: "flex", alignItems: "center" }}>
                        <img src={usuarioSesion.imagen_usuario} style={{ width: "50px", height: "auto" }} alt="user" />
                    </div>
                    <div className="column" style={{ display: "flex", alignItems: "center" }}>
                        {
                            usuarioSesion.usuario === liderGrupo.usuario_lider &&
                            <FontAwesomeIcon icon={faCrown} size="lg" style={{ color: "#efe815" }} />
                        }
                        <p className="is-size-5 has-text-weight-bold">{usuarioSesion.usuario}</p>
                    </div>
                </div>
            </div>
            {
                usuariosSala.map((usuario, index) => {
                    if (usuario._id !== sessionStorage.getItem("id_usuario")) {
                        return (
                            <div
                                className="box"
                                key={index + usuario.id_sesion}
                                style={
                                    usuariosSalaEspera.some(usuario_esperando => usuario_esperando._id === usuario._id)
                                        ? styleBoxUserReady
                                        : styleBoxUserNotReady
                                }
                            >
                                <div className="columns">
                                    <div className="column is-one-quarter" style={{ display: "flex", alignItems: "center" }}>
                                        <img src={usuario.imagen_usuario} style={{ width: "50px", height: "auto" }} alt="user" />
                                    </div>
                                    <div className="column" style={{ display: "flex", alignItems: "center" }}>
                                        {
                                            usuario.usuario === liderGrupo.usuario_lider &&
                                            <FontAwesomeIcon icon={faCrown} style={{ color: "#efe815" }} />
                                        }
                                        <p className="is-size-5 has-text-weight-bold">{usuario.usuario}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                })
            }
            {
                liderGrupo.id_lider === idUsuario &&
                <div className="has-text-centered">
                    <button className="button is-rounded is-primary" onClick={cambiarPaginaEncuesta}>{t('main.button')}</button>
                </div>
            }
        </div>
    )
}

export default SalaEspera