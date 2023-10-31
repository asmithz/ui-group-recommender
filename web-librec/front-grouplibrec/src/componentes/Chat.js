import { Formik, Form, Field } from "formik"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import "../css/StyleItemHover.css"
import ItemModal from "./ItemModal"
import { useTranslation } from "react-i18next"
import { t } from "i18next"

const Chat = (props) => {
    const { t, i18n } = useTranslation("componentes/chat")

    const idGrupo = props.idGrupo
    const usuarioId = sessionStorage.getItem("id_usuario")
    const [chatGrupo, setChatGrupo] = useState([])
    const [emitirMensaje, setEmitirMensaje] = useState(0)

    const chatStyle = {
        height: "500px",
        opacity: 1,
        backgroundColor: "#ffffff",
        transparent: 0,
        overflowY: "scroll"
    }

    const mensajeStyleEmisor = {
        marginBottom: "1px",
        wordWrap: "break-word",
        maxWidth: "400px",
    }

    const mensajeStyleReceptor = {
        marginBottom: "1px",
        wordWrap: "break-word",
        maxWidth: "400px",
    }

    const styleBoxChat = {
        height: "660px",
        position: "relative",
        border: "1px solid #000" 
    }

    useEffect(() => {
        obtenerChatGrupo()
    }, [])

    const obtenerChatGrupo = async () => {
        try {
            const resp_chat = await props.api.get("/obtener-chat-grupo", { params: { idGrupo } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (Array.isArray(resp_chat.data)) {
                setChatGrupo([...resp_chat.data])
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const obtenerUltimoMensajeGrupo = async () => {
        try{
            const resp_chat = await props.api.get("/obtener-ultimo-mensaje-chat", { params: { idGrupo } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (resp_chat.data) {
                setChatGrupo([...chatGrupo, resp_chat.data])
                console.log(resp_chat.data)
                console.log(chatGrupo)
            }
        }
        catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        props.socket.on("chat-desplegar-mensajes", () => {
            obtenerChatGrupo()
            //obtenerUltimoMensajeGrupo()
        })
        return () => {
            props.socket.off("chat-desplegar-mensajes")
        }
    }, [emitirMensaje])

    //useEffect(() => {
    //    props.socket.on("chat-desplegar-mensajes", () => {
    //        obtenerChatGrupo()
    //    })
    //}, [])


    const enviarMensaje = async (mensaje, tipo) => {
        const tiempo_actual = Date.now()
        let info = {}
        if (tipo === "texto") {
            info = {
                "idGrupo": idGrupo,
                "id_usuario": usuarioId,
                "texto": mensaje.texto,
                "timestamp": tiempo_actual,
                "tipo_mensaje": "texto"
            }
        }
        else if (tipo === "item") {
            info = {
                "idGrupo": idGrupo,
                "id_usuario": usuarioId,
                "texto": "Recomiendo esto",
                "timestamp": tiempo_actual,
                "tipo_mensaje": "item",
                "itemId": mensaje
            }
        }
        const enviar_req = await props.api.post("/enviar-mensaje-chat", (info), {
            headers: {
                "Content-type": "application/json"
            }
        })
        if (enviar_req) {
            props.socket.emit("chat-enviar-mensaje", idGrupo)
            setEmitirMensaje(emitirMensaje + 1)
        }
    }

    const mostrarMensajes = (chat) => {
        chat.sort((a, b) => a.timestamp - b.timestamp)

        return (
            <div>
                {
                    chat.map((mensaje) => (
                        mensaje.id_usuario === usuarioId ? (
                            <Mensaje t={t} style={mensajeStyleEmisor} tipo="emisor" justifyContent="flex-start" key={mensaje.timestamp + mensaje.usuario} mensaje={mensaje} liderGrupo={props.liderGrupo} idUsuario={usuarioId} enviarAlStack={props.enviarAlStack} idGrupo={idGrupo} />
                        ) : (
                            <Mensaje t={t} style={mensajeStyleReceptor} tipo="receptor" justifyContent="flex-start" key={mensaje.timestamp + mensaje.usuario} mensaje={mensaje} liderGrupo={props.liderGrupo} idUsuario={usuarioId} enviarAlStack={props.enviarAlStack} idGrupo={idGrupo}/>
                        )
                    ))
                }
            </div>
        )
    }

    return (
        <div className="box" style={styleBoxChat}>
            <div className="columns">
                <div className="column">
                    <h1>
                        <p className="is-size-4">{t('main.title')}</p>
                    </h1>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div style={chatStyle}>
                        {mostrarMensajes(chatGrupo)}
                    </div>
                </div>
            </div>
            <div className="columns" style={{ paddingBottom: "20px" }}>
                <div className="column">
                    <Formik
                        initialValues={{
                            id_usuario: "",
                            texto: ""
                        }}
                        onSubmit={(mensaje, { resetForm }) => {
                            enviarMensaje(mensaje, "texto")
                            resetForm()
                        }}>
                        <Form>
                            <div className="columns">
                                <div className="column is-four-fifths">
                                    <div className="field">
                                        <Field className="input" placeholder={t('main.input')} name="texto" />
                                    </div>
                                </div>
                                <div className="column has-text-right">
                                    <div className="field">
                                        <button className="button is-light is-success is-rounded" type="submit">
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    )
}

const Mensaje = (props) => {
    const convertirTiempo = (milisegundos) => {
        var date = new Date(milisegundos)
        var timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        timeString = timeString.replace(/( AM| PM)$/, '')
        return timeString
    }
    const [estadoItem, setEstadoItem] = useState(false)

    const chatEnviarAlStack = (idItem) => {
        props.enviarAlStack(idItem)
        setEstadoItem(false)
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: props.justifyContent }}>
                <div style={props.style}>
                    <p style={{ paddingLeft: "10px", paddingRight: "10px", paddingTop: "2px", paddingBottom: "2px" }}>
                        <span className="has-text-weight-bold" style={{ marginRight: "5px" }}>{convertirTiempo(props.mensaje.timestamp)}</span>
                        {
                            props.mensaje.tipo_mensaje === "texto" &&
                            <span className="has-text-weight-bold" style={{ marginRight: "5px" }}>
                                [
                                {
                                    props.mensaje.usuario === props.liderGrupo.usuario_lider &&
                                    <span><FontAwesomeIcon icon={faCrown} style={{ color: "#efe815" }} /></span>
                                }
                                {
                                    props.mensaje.usuario
                                }
                                ] :</span>
                        }
                        {
                            props.mensaje.tipo_mensaje === "texto" &&
                            <span>{props.mensaje.texto}</span>
                        }
                        {
                            props.mensaje.tipo_mensaje === "ingreso_sala" &&
                            <span style={{ color: '#8b09b3'}}>
                                {t('main.joinedRoom.user')} <span className="has-text-weight-bold">{props.mensaje.usuario}</span> {t('main.joinedRoom.joined')}
                            </span>
                        }
                        {
                            props.mensaje.tipo_mensaje === "rec_usuario" &&
                            (
                                <a className="hover-text" onClick={() => setEstadoItem(true)} style={{ color: "#0969b3"}}>
                                    {props.mensaje.usuarioDestinoID === props.idUsuario ? (
                                        <span>
                                            {props.t('main.user.userRecommend.user')} <span className="has-text-weight-bold">{props.mensaje.usuario}</span> {props.t('main.user.userRecommend.recommends')}  <span className="has-text-weight-bold">{props.mensaje.item.nombreItem}</span> -{" "}
                                            <span className="has-text-weight-bold">{props.mensaje.item.nombre_autor}</span>
                                        </span>
                                    ) : (
                                        <span>
                                            {props.t('main.user.recommendUser.youRecommend')} <span className="has-text-weight-bold">{props.mensaje.item.nombreItem}</span> -{" "}
                                            <span className="has-text-weight-bold">{props.mensaje.item.nombre_autor}</span> {props.t('main.user.recommendUser.to')} <span className="has-text-weight-bold">{props.mensaje.usuarioDestino}</span>
                                        </span>
                                    )}
                                </a>
                            )
                        }
                        {
                            props.mensaje.tipo_mensaje === "rec_grupal" &&
                            <a className="hover-text" onClick={() => setEstadoItem(true)} style={{ color: "#09b391"}}>
                                <span>{props.t('main.group.userRecommend.user')} <span className="has-text-weight-bold">{props.mensaje.usuario}</span> {props.t('main.group.userRecommend.recommends')} <span className="has-text-weight-bold">{props.mensaje.item.nombreItem} </span>- <span className="has-text-weight-bold">{props.mensaje.item.nombre_autor}</span></span>
                            </a>
                        }
                        {
                            props.mensaje.tipo_mensaje === "enviar_favoritos" &&
                            <a className="hover-text" onClick={() => setEstadoItem(true)} style={{ color: "#b30925"}}>
                                <span>{props.t('main.group.addedFavorites.user')} <span className="has-text-weight-bold">{props.mensaje.usuario}</span> {props.t('main.group.addedFavorites.added')} <span className="has-text-weight-bold">{props.mensaje.item.nombreItem} </span>- <span className="has-text-weight-bold">{props.mensaje.item.nombre_autor}</span> {props.t('main.group.addedFavorites.toFavorites')}</span>
                            </a>
                        }
                        {
                            props.mensaje.tipo_mensaje === "eliminar_favoritos" &&
                            <a className="hover-text" onClick={() => setEstadoItem(true)} style={{ color: "#b30925"}}>
                                <span>{props.t('main.group.removedFavorites.user')}  <span className="has-text-weight-bold">{props.mensaje.usuario}</span> {props.t('main.group.removedFavorites.removed')} <span className="has-text-weight-bold">{props.mensaje.item.nombreItem} </span>- <span className="has-text-weight-bold">{props.mensaje.item.nombre_autor}</span>  {props.t('main.group.removedFavorites.toFavorites')} </span>
                            </a>
                        }
                        {
                            props.mensaje.tipo_mensaje === "item" &&
                            <>
                                <br></br>
                                <img
                                    className="rounded object-cover img-hover"
                                    src={props.mensaje.pathItem}
                                    alt={props.mensaje.idItem}
                                    style={{ width: 90, height: 150, borderRadius: "8%" }}
                                />
                            </>
                        }
                    </p>
                </div>
            </div>
            {
                props.mensaje.item &&
                <ItemModal abierto="chat" item={props.mensaje.item} estado={estadoItem} cambiarEstado={setEstadoItem} enviarAlStack={chatEnviarAlStack} chat={true} idUsuario={props.idUsuario} idGrupo={props.idGrupo}/>
            }
        </>
    )

}

export default Chat
