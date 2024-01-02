import { useEffect, useState } from "react"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMusic, faHeadphonesSimple, faThumbsUp, faPeopleGroup } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const DestinatarioUsuarioModal = (props) => {
    const { t, i18n } = useTranslation("componentes/destinatario_usuario_modal")

    const [usuariosSesion, setUsuariosSesion] = useState([])
    const [emitirMensaje, setEmitirMensaje] = useState(0)
    const idItem = props.item.idItem
    const nombreItem = props.item.nombreItem
    const nombreAutor = props.item.nombre_autor
    const tipoItem = props.item.tipoItem
    const urlAutor = props.item.url_autor
    const urlItem = props.item.url_item
    const originAutor = props.item.origin_autor
    const continentAutor = props.item.continent_autor
    const pathItem = props.item.pathImagen
    const styleModal = {
        backgroundColor: "white",
        padding: "50px",
        borderRadius: "10px"
    }

    const recomendarItem = async (item, tipo, usuarioDestinoID, usuarioDestino) => {
        const tiempo_actual = Date.now()
        let info = {}
        let eventoRecomendar = {
            idSala: props.idGrupo,
            idUsuario: props.idUsuario,
            evento: "recomendados"
        }
        if (tipo === "rec_grupal") {
            info = {
                "idGrupo": props.idGrupo,
                "id_usuario": props.idUsuario,
                item: item,
                "texto": "",
                "timestamp": tiempo_actual,
                "tipo_mensaje": "rec_grupal",
                "grupoDestino": usuarioDestinoID
            }
        }
        else if (tipo === "rec_usuario") {
            info = {
                "idGrupo": props.idGrupo,
                "id_usuario": props.idUsuario,
                item: item,
                "texto": "",
                "timestamp": tiempo_actual,
                "tipo_mensaje": "rec_usuario",
                "usuarioDestinoID": usuarioDestinoID,
                "usuarioDestino": usuarioDestino
            }
        }
        try {
            await api.post("/enviar-mensaje-chat", (info), {
                headers: {
                    "Content-type": "application/json"
                }
            })
            const enviar_evento = await api.post("/evento-usuario", (eventoRecomendar), {
                headers: {
                    "Content-type": "application/json"
                }
            })

            props.socket.emit("chat-enviar-mensaje", props.idGrupo)
            setEmitirMensaje(emitirMensaje + 1)
            props.cambiarEstado(false)
        }
        catch (error) {
            console.log(error)
        }
    }

    const obtenerUsuariosSala = async (idGrupo) => {
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
    }

    useEffect(() => {
        if (props.estado) obtenerUsuariosSala(props.idGrupo)
    }, [props.estado])

    return (
        <>
            {
                props.estado &&
                <div className={props.estado ? "modal is-active" : "modal"}>
                    <div className={props.estado ? "modal-background" : ""} onClick={() => props.cambiarEstado(false)}></div>
                    <div className="modal-content" style={styleModal}>
                        <div className="block">
                            <p className="modal-card-title"><span className="has-text-weight-bold">{t('main.title')}</span></p>
                        </div>
                        <div className="block">
                            <p className="modal-card-title"><span className="has-text-weight-bold">{nombreItem}</span> - {nombreAutor}</p>
                            <br />
                            <div className="columns">
                                <div className="column">
                                    <img src={props.historial ? props.item.pathItem : pathItem} alt={idItem} style={{ height: 300, width: 400, borderRadius: "10px" }} />
                                </div>
                                <div className="column">
                                    <div className="columns">
                                        <div className="column">
                                            <p>{t('main.item.genre')}: {tipoItem}</p>
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            <p>{t('main.item.origin')}: {originAutor} - {continentAutor}</p>
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            <a href={urlItem} target="_blank"><FontAwesomeIcon icon={faMusic} /> {t('main.item.clickToListen')} <FontAwesomeIcon icon={faMusic} /> </a>
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            <a href={urlAutor} target="_blank"><FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> {t('main.item.viewMore')} <FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="block has-text-centered">
                                <div className="box">
                                    <div className="columns is-vcentered">
                                        <div className="column">
                                            <FontAwesomeIcon icon={faPeopleGroup} style={{ height: 60, color: "#09b391" }} />
                                        </div>
                                        <div className="column">
                                            <p className="has-text-weight-bold"> {t('main.recommendTo.everyone')} </p>
                                        </div>
                                        <div className="column">
                                            <button className="button is-rounded is-primary is-light" onClick={() => recomendarItem(props.item, "rec_grupal", props.idGrupo, 0)}>
                                                <p>
                                                    <span>{t('main.recommendTo.button.everyone')}  </span>
                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                </p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {
                                    usuariosSesion.length > 0 &&
                                    usuariosSesion.map((usuarioSala, index) => {
                                        return <div key={index}>
                                            {
                                                usuarioSala._id !== props.idUsuario &&
                                                <div className="box">
                                                    <div className="columns is-vcentered">
                                                        <div className="column">
                                                            <img src={usuarioSala.imagen_usuario} style={{ width: "40%" }} />
                                                        </div>
                                                        <div className="column">
                                                            <p className="has-text-weight-bold">{usuarioSala.usuario}</p>
                                                        </div>
                                                        <div className="column">
                                                            <button className="button is-rounded is-info is-light" onClick={() => recomendarItem(props.item, "rec_usuario", usuarioSala._id, usuarioSala.usuario)}>
                                                                <p>
                                                                    <span>{t('main.recommendTo.button.user')}   </span>
                                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                                </p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
export default DestinatarioUsuarioModal