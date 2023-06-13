import { Formik, Form, Field } from "formik"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { useDrop } from "react-dnd"

const Chat = (props) => {
    const idGrupo = props.idGrupo
    const usuarioId = sessionStorage.getItem("id_usuario")
    const [chatGrupo, setChatGrupo] = useState([])
    const [emitirMensaje, setEmitirMensaje] = useState(0)

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "item",
        drop: (item) => {
            enviarMensaje(item.id, "item")
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver()
        })
    }))

    const chatStyle = {
        height: "220px",
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
            if(Array.isArray(resp_chat.data)){
                setChatGrupo([...resp_chat.data])
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        props.socket.on("chat-desplegar-mensajes", () => {
            obtenerChatGrupo()
        })
    }, [emitirMensaje])


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
                            <Mensaje style={mensajeStyleEmisor} tipo="emisor" justifyContent="flex-start" key={mensaje.timestamp + mensaje.usuario} mensaje={mensaje} liderGrupo={props.liderGrupo} />
                        ) : (
                            <Mensaje style={mensajeStyleReceptor} tipo="receptor" justifyContent="flex-start" key={mensaje.timestamp + mensaje.usuario} mensaje={mensaje} liderGrupo={props.liderGrupo} />
                        )
                    ))
                }
            </div>
        )
    }

    return (
        <div className="box" style={props.styleChat}>
            <div ref={drop} className="columns is-centered is-flex-direction-column is-vcentered">
                <div className="column is-full">
                    <div style={chatStyle}>
                        {mostrarMensajes(chatGrupo)}
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column" style={{ height: "100%" }}>
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
                                        <Field className="input" placeholder="Ingrese un mensaje" name="texto" />
                                    </div>
                                </div>
                                <div className="column">
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

    return (
        <div style={{ display: "flex", justifyContent: props.justifyContent }}>
            <div style={props.style}>
                <p style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                    <span className="has-text-weight-bold" style={{ marginRight: "5px" }}>{convertirTiempo(props.mensaje.timestamp)}</span>
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
                    {
                        props.mensaje.tipo_mensaje === "texto" &&
                        <span>{props.mensaje.texto}</span>
                    }
                    {
                        props.mensaje.tipo_mensaje === "item" &&
                        <>
                        <br></br>
                            <img
                                className="rounded object-cover"
                                src={props.mensaje.pathItem}
                                alt={props.mensaje.idItem}
                                style={{ width: 90, height: 150, borderRadius: "8%" }}
                            />
                        </>
                    }
                </p>
            </div>
        </div>
    )

}

export default Chat
