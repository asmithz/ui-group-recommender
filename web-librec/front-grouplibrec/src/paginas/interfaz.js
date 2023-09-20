import { useContext, useEffect, useState } from "react"
import img_usuario from "../images/user.png"
import io from "socket.io-client"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Calificar from "./calificar"
import HorizontalScroll from "react-horizontal-scrolling"
import Lottie from "lottie-react"
import loading from "../animations/loading.json"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Interfaz = () => {
    const navigate = useNavigate()
    const [idSesion, setIdSesion] = useState("")
    const [usuariosSesion, setUsuariosSesion] = useState({})
    const [usuarioSesion, setUsuarioSesion] = useState({})
    const [calificaciones, setCalificaciones] = useState(false)
    const [emitirSignal, setEmitirSignal] = useState(0)
    const [recomendacionesIndividuales, setRecomendacionesIndividuales] = useState([])
    const [recomendacionesGrupales, setRecomendacionesGrupales] = useState([])
    const [recomendar, setRecomendar] = useState(false)
    const [cargando, setCargando] = useState(false)

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
        setCalificaciones(true)
    }

    useEffect(() => {
        if (sessionStorage.getItem("id_sesion") !== null) {
            setIdSesion(sessionStorage.getItem("id_sesion"))
        }
        else {
            navigate("/ingresar", { replace: true })
        }
    }, [])

    useEffect(() => {
        socket.on("conectado", async () => {
	  try{
            const resp = await api.get("/obtener-usuarios")
            setUsuariosSesion(resp.data)
            Object.values(resp.data).map((usuario) => {
                if (usuario.id_sesion === String(idSesion)) {
                    setUsuarioSesion(usuario)
                }
            })
	  }
	  catch (error){
	    console.log("Error al obtener usuarios")
	  }
        })
    }, [emitirSignal])


    // arreglar
    useEffect(() => {
        socket.on("usuario-desconectado", async (id) => {
            //let nuevo = usuariosSesion
            //// no funciona el delete
            //delete nuevo[String(id)]
            //setUsuariosSesion(nuevo)
            ////eliminar su fichero si se desconecta
            //try {
            //    await api.delete("/eliminar-fichero", {
            //        id_sesion: id
            //    })
            //}
            //catch (error) {
            //    console.log(error)
            //}

            try {
		const newUsuariosSesion = { ...usuariosSesion }
		console.log(newUsuariosSesion)
		delete newUsuariosSesion[String(id)]
		console.log(newUsuariosSesion)
		setUsuariosSesion(newUsuariosSesion)
                await api.delete("/eliminar-fichero", {
                    id_sesion: id
                })
            }
            catch (error) {
                console.log(error)
            }
        })
    }, [socket])

    useEffect(() => {
        socket.emit("entrar-sala")
        setEmitirSignal(emitirSignal + 1)
    }, [])

    //useEffect(() => {
    //    const obtenerRecomendacionesIndividuales = async () => {
    //        try {
    //            const a = await api.get("/obtener-recomendaciones-individuales", {
    //                id_sesion: sessionStorage.getItem("id_sesion")
    //            })
    //            console.log(a.data)
    //        }
    //        catch (error) {
    //            console.log(error)
    //        }
    //    }
    //    obtenerRecomendacionesIndividuales()
    //}, [idSesion])

    socket.on("mostrar-recomendaciones", async (recomendacion_grupo) => {
        //recomendacion individual por usuario
        const resp_individual = await api.post("/obtener-recomendaciones-individuales", usuarioSesion)
        setRecomendacionesIndividuales(resp_individual.data)
        setRecomendacionesGrupales(recomendacion_grupo)
        setCargando(false)
        socket.emit("cargando-enviar", false)
    })

    const obtenerRecomendaciones = async () => {
        //recomendacion grupal
        const resp_grupo = await api.post("/obtener-recomendaciones-grupo")
        socket.emit("obtener-recomendaciones", resp_grupo.data)
        //setRecomendacionesIndividuales(resp_individual.data)
        //setRecomendacionesGrupales(resp_grupo.data)
    }

    //useEffect(() => {
    //    obtenerRecomendaciones()
    //    console.log("asdf")
    //})

    const obtenerRecomendacionesIndividuales = async () => {
        try {
            const resp = await api.post("/obtener-recomendaciones-individuales", usuarioSesion)
            setRecomendacionesIndividuales(resp.data)
        }
        catch (error) {
            console.log(error)
        }
    }

    const obtenerRecomendacionesGrupos = async () => {
        try {
            const resp = await api.post("/obtener-recomendaciones-grupo")
            setRecomendacionesGrupales(resp.data)
        }
        catch (error) {
            console.log(error)
        }
    }

    socket.on("cargando", (valor) => {
        setCargando(valor)
    })

    const iniciarRecomendacion = async () => {
        setCargando(true)
        socket.emit("cargando-enviar", true)
        try {
            const resp = await api.get("/recomendar")
            if (resp.data.ejecutado) {
                obtenerRecomendaciones()
            }
            setRecomendar(true)
        }
        catch (error) {
            console.log(error)
        }
    }

    //useEffect(() => {
    //    const obtenerUsuarios = async () => {
    //        const resp = await api.get("/obtener-usuarios")
    //        setUsuariosSesion(resp.data)
    //        Object.values(resp.data).map((usuario) => {
    //            if (usuario.id_sesion === String(idSesion)) {
    //                setUsuarioSesion(usuario)
    //            }
    //        })
    //    }
    //    obtenerUsuarios()
    //})

    //useEffect(() => {
    //    //cantidad de usuarios conectados
    //    console.log(Object.keys(usuariosSesion).length)
    //}, [usuariosSesion])

    return (
        <div style={stylePagina}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-1 has-text-centered">GroupLibrec</p>
                </div>
            </div>
            <div className="columns">
                {/* Usuarios */}
                <div className="column is-one-fifth">
                    <div className="box">
                        <div className="columns">
                            <div className="column is-two-fifths">
                                <img src={usuarioSesion.imagen_path} style={{ width: "100%", height: "100%" }} alt="user" />
                            </div>
                            <div className="column">
                                <div className="columns">
                                    <div className="column ">
                                        <p className="is-size-5 has-text-weight-bold">{usuarioSesion.nombre}</p>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="column ">
                                        <p className="is-size-5 has-text-weight-bold">ID: {usuarioSesion.numero_usuario}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        Object.values(usuariosSesion).map((usuario, index) => {
                            if (usuario.id_sesion !== idSesion) {
                                return (
                                    <div className="box" key={index + "" + usuario.id_sesion} >
                                        <div className="columns">
                                            <div className="column is-two-fifths">
                                                <img src={usuario.imagen_path} style={{ width: "100%", height: "100%" }} alt="user" />
                                            </div>
                                            <div className="column">
                                                <div className="columns">
                                                    <div className="column">
                                                        <p className="is-size-5 has-text-weight-bold">{usuario.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="columns">
                                                    <div className="column">
                                                        <p className="is-size-5 has-text-weight-bold">ID: {usuario.numero_usuario}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                {/* Recomendaciones */}
                <div className="column is-half">
                    {/* Recomendaciones individuales */}
                    <div className="columns">
                        <div className="column">
                            <div className="box" style={{ height: 320 }}>
                                <div className="columns">
                                    <div className="column">
                                        <p className="is-size-4">Individual Recommendations</p>
                                    </div>
                                </div>
                                <div className="columns">
                                    {
                                        !cargando &&
                                        <div className="column" >
                                            <HorizontalScroll style={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
                                                {
                                                    recomendacionesIndividuales.length > 0 &&
                                                    recomendacionesIndividuales.map((item, index) => {
                                                        return <Tarjeta item={item} key={index} />
                                                    })
                                                }
                                            </HorizontalScroll>
                                            {
                                                recomendacionesIndividuales.length === 0 &&
                                                <p className="is-size-3">No recommendations yet</p>
                                            }

                                        </div>
                                    }
                                    {
                                        cargando &&
                                        <div className="column">
                                            <Lottie
                                                animationData={loading}
                                                loop={true}
                                                height={200}
                                                width={200}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Recomendaciones grupales */}
                    <div className="columns">
                        <div className="column">
                            <div className="box" style={{ height: 320 }}>
                                <div className="columns">
                                    <div className="column">
                                        <p className="is-size-4">Room recommendations</p>
                                    </div>
                                </div>
                                <div className="columns">
                                    {
                                        !cargando &&
                                        <div className="column">
                                            <div className="columns">
                                                <HorizontalScroll style={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
                                                    {
                                                        recomendacionesGrupales.length > 0 &&
                                                        recomendacionesGrupales.map((item, index) => {
                                                            return <Tarjeta item={item} key={index + "grupo"} />
                                                        })
                                                    }
                                                </HorizontalScroll>
                                                {
                                                    recomendacionesGrupales.length === 0 &&
                                                    <p className="is-size-3">No recommendations yet</p>
                                                }
                                            </div>
                                        </div>
                                    }
                                    {
                                        cargando &&
                                        <div className="column">
                                            <Lottie
                                                animationData={loading}
                                                loop={true}
                                                height={200}
                                                width={200}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
	    <div className="column">
	      <div className="columns">
		<div className="column">
		  <div className="box" style={styleChat}>
		    <p className="is-size-4">Chat</p>
		  </div>
		</div>
	      </div>
	      <div className="columns">
		<div className="column">
		  <div className="box" style={styleStackRecomendaciones}>
		    <p className="is-size-4">My saved recommendations</p>
		  </div>
		</div>
	      </div>
	    </div>
            </div>
            {/* Botones importantes */}
            <div className="columns">
                <div className="column">
                    <button className="button is-info is-light is-large" onClick={activarCalificaciones}>Rate items</button>
                </div>
                <div className="column">
                    <button className="button is-primary is-light is-large" onClick={iniciarRecomendacion}>Recommend</button>
                </div>
            </div>
            <Calificar activo={calificaciones} cerrar={setCalificaciones} idUsuario={usuarioSesion.numero_usuario} />
        </div>
    )
}

const Tarjeta = (props) => {
    return (
        <div className="column">
            <img
                className="rounded object-cover"
                src={props.item.pathImagen}
                alt={props.item.idPelicula}
                style={{ height: 150, width: 90, display: "inline-block" }} />
        </div>
    )

}

export default Interfaz
