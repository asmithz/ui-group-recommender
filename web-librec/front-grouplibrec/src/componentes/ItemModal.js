import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faMusic, faHeadphonesSimple, faTrophy } from "@fortawesome/free-solid-svg-icons"
import { Rating } from "react-simple-star-rating"
import { useEffect, useState } from "react"
import axios from "axios"
import { useTranslation } from "react-i18next"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const ItemModal = (props) => {
    const { t, i18n } = useTranslation("componentes/item_modal")

    const idGrupo = props.idGrupo
    const idItem = props.item.idItem
    const nombreItem = props.item.nombreItem
    const nombreAutor = props.item.nombre_autor
    const tipoItem = props.item.tipoItem
    const urlAutor = props.item.url_autor
    const urlItem = props.item.url_item
    const originAutor = props.item.origin_autor
    const continentAutor = props.item.continent_autor
    const pathItem = props.item.pathItem
    const [puntuacion, setPuntuacion] = useState(0)
    const idUsuario = sessionStorage.getItem("id_usuario")

    const styleModal = {
        backgroundColor: "white",
        padding: "50px",
        borderRadius: "10px"
    }
    const styleButtonItem = {
        borderRadius: "50%",
        marginRight: "10px",
        marginLeft: "10px",
    }
    const puntuacionItem = async (valor) => {
        try {
            if (idUsuario && idItem) {
                let calificacion = {
                    id_usuario: idUsuario,
                    id_item: idItem,
                    rating: valor
                }
                await api.post("/calificar-item", calificacion, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                setPuntuacion(valor)
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    const obtenerItem = async () => {
        try {
            if (idUsuario && idItem) {
                const resp_item = await api.get("/obtener-item-calificacion", { params: { idUsuario, idItem } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (!resp_item.data.item) {
                    setPuntuacion(0)
                }
                else {
                    setPuntuacion(resp_item.data.item.rating)
                }
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const eventoVisto = async () => {
        let info = {
                idSala: idGrupo,
                idUsuario: idUsuario,
                evento: "vistos"
        }
        try {
            if (idUsuario && idItem) {
                const enviar_evento = await api.post("/evento-usuario", (info), {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const eventoEscuchado = async () => {
        let info = {
                idSala: idGrupo,
                idUsuario: idUsuario,
                evento: "escuchados"
        }
        try {
            if (idUsuario && idItem) {
                const enviar_evento = await api.post("/evento-usuario", (info), {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (props.estado) {
            obtenerItem()
            eventoVisto()
        }
    }, [props.estado])

    return (
        <>
            {
                props.estado &&
                <div className={props.estado ? "modal is-active" : "modal"}>
                    <div className={props.estado ? "modal-background" : ""} onClick={() => props.cambiarEstado(false)}></div>
                    <div className="modal-content" style={styleModal}>
                        <p className="modal-card-title"><span className="has-text-weight-bold">{nombreItem}</span> - {nombreAutor}</p>
                        <br />
                        <div className="columns">
                            <div className="column">
                                <img src={pathItem} alt={idItem} style={{ height: 300, width: 400, borderRadius: "10px" }} />
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
                                        <a href={urlItem} onClick={eventoEscuchado} target="_blank"><FontAwesomeIcon icon={faMusic} /> {t('main.item.clickToListen')} <FontAwesomeIcon icon={faMusic} /> </a>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="column">
                                        <a href={urlAutor} target="_blank"><FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> {t('main.item.viewMore')} <FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> </a>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="column">
                                        {t('main.item.rate')}: <Rating
                                            onClick={puntuacionItem}
                                            initialValue={puntuacion}
                                        />
                                    </div>
                                </div>
                                {props.chat &&

                                    <div className="columns">
                                        <div className="column">
                                            <button className="button" style={styleButtonItem} onClick={() => props.enviarAlStack(idItem)}>
                                                <FontAwesomeIcon icon={faHeart} style={{ color: "#e41b43", }} />
                                            </button>
                                        </div>
                                    </div>
                                }
                                {
                                    /*
                                    
                                <div className="columns">
                                    <div className="column">
                                        Calificación: <Rating
                                            onClick={puntuacionPelicula}
                                            initialValue={puntuacion}
                                        />
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="column">
                                        {
                                            peliculaCalificada &&
                                            <Lottie animationData={checkMark} loop={false} />
                                        }
                                    </div>
                                </div>
                                    
                                    */
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ItemModal