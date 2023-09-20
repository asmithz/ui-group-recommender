import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faAnglesDown } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import SlidingPane from "react-sliding-pane"
import axios from "axios"
import ListaItems from "./ListaItems"
import "../css/PanelFavoritos.css"
import io from "socket.io-client"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const PanelFavoritos = (props) => {
    const idGrupo = props.idGrupo
    const idUsuario = props.idUsuario
    const [stackUsuario, setStackUsuario] = useState({})
    const [panelFavoritos, setPanelFavoritos] = useState(false)
    const [stackFavoritos, setStackFavoritos] = useState({})
    const [favoritoEliminado, setFavoritoEliminado] = useState(0)

    //const obtenerStackUsuario = async (idGrupo, idUsuario) => {
    //    try {
    //        const itemsStack = await api.get("/obtener-stack-usuario", { params: { idGrupo, idUsuario } }, {
    //            headers: {
    //                "Content-type": "application/json"
    //            }
    //        })
    //        if (itemsStack.data) {
    //            setStackUsuario(itemsStack.data.items)
    //        }
    //    }
    //    catch (error) {
    //        console.log(error)
    //    }
    //}

    const obtenerStackFavoritos = async (idGrupo, idUsuario) => {
        try {
            const itemsStack = await api.get("/obtener-favoritos-sala", { params: { idGrupo, idUsuario } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (itemsStack.data) {
                setStackFavoritos(itemsStack.data.items)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    // iniciar nuevo socket
    useEffect(() => {
        socket.emit("entrar-panel-favoritos", idGrupo)
    }, [])

    //  obtener favoritos 
    useEffect(() => {
        socket.on("obtener-favoritos", () => {
            obtenerStackFavoritos(idGrupo, idUsuario)
        })
    }, [favoritoEliminado])

    const eliminarDelStack = async (idGrupo, idItem) => {
        try {
            const tiempo_actual = Date.now()
            let info = {
                "idGrupo": idGrupo,
                "id_usuario": idUsuario,
                "texto": "Eliminar de favoritos",
                "timestamp": tiempo_actual,
                "tipo_mensaje": "eliminar_favoritos",
                "itemId": idItem
            }
            const mensaje_eliminar_favoritos = await api.post("/enviar-mensaje-chat", (info), {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (mensaje_eliminar_favoritos) {
                socket.emit("eliminar-favorito-grupo", idGrupo, idItem)
                socket.emit("chat-enviar-mensaje", idGrupo)
                setFavoritoEliminado(favoritoEliminado + 1)
            }

        }
        catch (error) {
            console.log(error)
        }
        //try {
        //    await api.delete("/eliminar-de-favoritos", {
        //        data: itemStack,
        //        headers: {
        //            "Content-type": "application/json"
        //        }
        //    })

        //} catch (error) {
        //    console.log(error);
        //}
    }

    const abrirPanelFavoritos = () => {
        //obtenerStackUsuario(idGrupo, idUsuario)
        obtenerStackFavoritos(idGrupo, idUsuario)
        setPanelFavoritos(true)
    }

    return (
        <div>
            <div className="columns" >
                <div className="column has-text-centered">
                    <button className="button is-danger is-light is-rounded is-large" onClick={abrirPanelFavoritos}>
                        <FontAwesomeIcon icon={faHeart} style={{ color: "#e41b43", }} />
                    </button>
                </div>
            </div>
            <SlidingPane
                className="panel"
                isOpen={panelFavoritos}
                from="bottom"
                onRequestClose={() => {
                    setPanelFavoritos(false)
                }}
                width="50%"
                hideHeader={true}
            >
                <div className="columns">
                    <div className="column">
                        <p className="is-size-4">Room's favorites</p>
                    </div>
                    <div className="column has-text-right">
                        <button className="button is-danger is-light is-rounded" onClick={() => setPanelFavoritos(false)}>
                            <FontAwesomeIcon icon={faAnglesDown} style={{ color: "#f47b7b" }} />
                        </button>
                    </div>
                </div>
                <div className="is-flex is-flex-wrap-wrap" style={{ overflowY: "scroll", height: 700 }}>
                    {stackFavoritos &&
                        <ListaItems recomendaciones={stackFavoritos} tipo="stack" eliminarDelStack={eliminarDelStack} idGrupo={idGrupo} idUsuario={idUsuario} />
                    }
                </div>
            </SlidingPane>
        </div>
    )

}

export default PanelFavoritos