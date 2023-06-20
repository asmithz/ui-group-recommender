import { useEffect, useState } from "react"
import io from "socket.io-client"
import { useNavigate, useParams, Link } from "react-router-dom"
import axios from "axios"
import Calificar from "./calificar"
import Chat from "../componentes/Chat.js"
import TarjetaRecomendaciones from "../componentes/TarjetaRecomendaciones"
import TarjetaUsuario from "../componentes/TarjetaUsuario"
import { useDrop } from "react-dnd"
import ListaItems from "../componentes/ListaItems"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket ,faPeopleGroup, faStar, faUser } from "@fortawesome/free-solid-svg-icons"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Grupo = () => {
    const idGrupo = useParams().id
    const navigate = useNavigate()
    const [idUsuario, setIdUsuario] = useState(sessionStorage.getItem("id_usuario"))
    const [idSesion, setIdSesion] = useState(sessionStorage.getItem("id_sesion"))
    const [usuarioSesion, setUsuarioSesion] = useState({})
    const [usuariosSesion, setUsuariosSesion] = useState([])
    const [calificacionesEstado, setCalificacionesEstado] = useState(false)
    const [emitirSignal, setEmitirSignal] = useState(0)
    const [recomendacionesIndividuales, setRecomendacionesIndividuales] = useState([])
    const [recomendacionesGrupales, setRecomendacionesGrupales] = useState([])
    const [cargandoGrupo, setCargandoGrupo] = useState(false)
    const [cargandoIndividual, setCargandoIndividual] = useState(false)
    const [salaGrupo, setSalaGrupo] = useState({})
    const [liderGrupo, setLiderGrupo] = useState({ id_lider: null, usuario_lider: null })
    const [stackUsuario, setStackUsuario] = useState([])

    const styleChat = {
        height: "320px"
    }

    const styleStackRecomendaciones = {
        height: "320px"
    }

    const stylePagina = {
        margin: "20px"
    }

    const activarCalificaciones = () => {
        setCalificacionesEstado(true)
    }

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

    // obtener sala
    useEffect(() => {
        const obtenerSalaGrupo = async () => {
            try {
                const sala = await api.get("/obtener-sala", { params: { idGrupo } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                setSalaGrupo(sala.data)
                const lider_del_grupo = sala.data.usuarios_activos.find(lider => lider.usuario === sala.data.lider)
                const lider_grupo = {
                    ...liderGrupo,
                    id_lider: lider_del_grupo._id,
                    usuario_lider: lider_del_grupo.usuario
                }
                setLiderGrupo(lider_grupo)
            }
            catch (error) {
                console.log(error)
            }
        }
        obtenerSalaGrupo()
    }, [])

    // Obtener usuarios del grupo cuando alguien se une a la sala
    useEffect(() => {
        socket.on("update-grupo", async () => {
            try {
                const resp_grupo = await api.get("/obtener-usuarios-grupo", { params: { idGrupo } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                setUsuariosSesion(resp_grupo.data)
            }
            catch (error) {
                console.log("Error al obtener usuarios")
            }
        })
    }, [emitirSignal])

    // señal cuando alguien se une al grupo
    useEffect(() => {
        if (idGrupo && idSesion) {
            socket.emit("entrar-sala", idGrupo, idSesion)
            setEmitirSignal(emitirSignal + 1)
        }
    }, [idGrupo, idSesion])

    const salirGrupo = () => {
        socket.emit("salir-sala", idGrupo, idSesion)
        setEmitirSignal(emitirSignal + 1)
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
            const recomendacion_individual = await api.get("/ejecutar-recomendacion-individual", { params: { idUsuario, idGrupo } }, {
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
        try {
            await api.post("/enviar-al-stack", itemStack, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            obtenerStackUsuario(idGrupo, idUsuario)
        }
        catch (error) {
            console.log(error)
        }
    }

    const obtenerStackUsuario = async (idGrupo, idUsuario) => {
        try {
            const itemsStack = await api.get("/obtener-stack-usuario", { params: { idGrupo, idUsuario } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            setStackUsuario(itemsStack.data.items)
        }
        catch (error) {
            console.log(error)
        }
    }

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "item",
        drop: (item) => {
            enviarAlStack(item.id)
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver()
        })
    }))

    useEffect(() => {
        obtenerStackUsuario(idGrupo, idUsuario)
    }, [])

    return (
        <div style={stylePagina}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-1 has-text-centered">Sala de {salaGrupo.lider}</p>
                </div>
            </div>
            <div className="columns">
                {/* Usuarios */}
                <div className="column is-one-fifth">
                    <p className="is-size-1 has-text-centered">Conectados</p>
                    <div className="box">
                        <TarjetaUsuario usuario={usuarioSesion} liderGrupo={liderGrupo} />
                    </div>
                    {
                        Object.values(usuariosSesion).map((usuario, index) => {
                            if (usuario._id !== sessionStorage.getItem("id_usuario")) {
                                return (
                                    <div className="box" key={index + "" + usuario.id_sesion} >
                                        <TarjetaUsuario usuario={usuario} liderGrupo={liderGrupo} />
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                {/* Recomendaciones */}
                <div className="column is-half">
                    {/* Recomendaciones individuales */}
                    <TarjetaRecomendaciones idUsuario={idUsuario} idGrupo={idGrupo} tipoRecomendacion="individual" recomendaciones={recomendacionesIndividuales} cargando={cargandoIndividual} />
                    {/* Recomendaciones grupales */}
                    <TarjetaRecomendaciones idUsuario={idUsuario} idGrupo={idGrupo} tipoRecomendacion="grupal" recomendaciones={recomendacionesGrupales} cargando={cargandoGrupo} />
                </div>
                <div className="column">
                    { /* Chat Grupal */}
                    <div className="columns">
                        <div className="column">
                            <Chat socket={socket} api={api} idGrupo={idGrupo} styleChat={styleChat} liderGrupo={liderGrupo} />
                        </div>
                    </div>
                    { /* Stack Recomendaciones */}
                    <div ref={drop} className="columns">
                        <div className="column">
                            <div className="box" style={styleStackRecomendaciones}>
                                <p className="is-size-4">Mis favoritos</p>
                                <ListaItems recomendaciones={stackUsuario} tipo="stack" />
                            </div>
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
                { /* Recomendación Grupal solo líder */
                    liderGrupo.id_lider === idUsuario &&
                    <div className="column">
                        <button className="button is-primary is-large is-rounded" onClick={ejecutarRecomendacionGrupo}>
                            <FontAwesomeIcon icon={faPeopleGroup}/>
                        </button>
                    </div>
                }
                <div className="column">
                    <button className="button is-primary is-large is-rounded" onClick={ejecutarRecomendacionIndividual}>
                        <FontAwesomeIcon icon={faUser} />
                    </button>
                </div>
                <div className="column">
                    <Link to="/salas">
                        <button className="button is-warning is-large is-right is-rounded" onClick={salirGrupo}>
                            <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        </button>
                    </Link>
                </div>
            </div>
            <Calificar estado={calificacionesEstado} cambiarEstado={setCalificacionesEstado} idUsuario={idUsuario} />
        </div>
    )
}

export default Grupo
