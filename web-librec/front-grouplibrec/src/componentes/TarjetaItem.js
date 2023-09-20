import { useDrag } from "react-dnd"
import { Tooltip } from "react-tooltip"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faThumbsUp, faThumbsDown, faEye, faPeopleGroup, faHeartBroken } from "@fortawesome/free-solid-svg-icons"
import "../css/StyleItemHover.css"
import { useState } from "react"
import axios from "axios"
import ItemModal from "./ItemModal"
import DestinatarioUsuarioModal from "./DestinatarioUsuarioModal"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const TarjetaItem = (props) => {
    const itemId = props.item.idItem
    const [detailItem, setDetailItem] = useState(false)
    const [item, setItem] = useState(props.item)
    const [modalEstado, setModalEstado] = useState(false)
    const [destinoEstado, setDestinoEstado] = useState(false)

    const styleNotDragged = {
        height: 150,
        width: 120,
        display: "inline-block",
        borderRadius: "8%"
    }

    const styleTooltip = {
        backgroundColor: "#919191",
        borderRadius: "10px",
        transition: "all 0.3s ease-in-out"
    }

    const styleTooltipCheckItem = {
        backgroundColor: "#919191",
        borderRadius: "10px",
        height: "300px",
        transition: "all 0.3s ease-in-out"
    }

    const styleButtonItem = {
        borderRadius: "50%",
        marginRight: "10px",
        marginLeft: "10px",
    }

    const cambiarStyleItem = () => {
        setDetailItem(!detailItem)
    }

    const obtenerItemData = async (idItem) => {
        try {
            const itemData = await api.get("/obtener-item", { params: { idItem } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (itemData.data) {
                setItem(itemData.data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {
                props.tipo !== "stack" &&
                <div className="columns">
                    <div className="column is-one-third" id="clickable">
                        <img
                            className="rounded object-cover img-hover"
                            src={props.item.pathImagen}
                            alt={props.item.idItem}
                            style={styleNotDragged} />
                        <br />
                    </div>
                    <div className="column">
                        <div className="columns">
                            <div className="column">
                                {props.item !== null &&
                                    <div>
                                        <p> <span className="has-text-weight-bold">{props.item.nombreItem} - </span> {props.item.nombre_autor} </p>
                                        {/*
                                        <p>{parseFloat(props.item.rating).toFixed(0)}</p>
                                    */}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="is-flex-direction-row">
                                    <button className="button" style={styleButtonItem} onClick={() => setDestinoEstado(true)}>
                                        <FontAwesomeIcon icon={faPeopleGroup} style={{ color: "#09b391" }} />
                                    </button>
                                    <button className="button" style={styleButtonItem} onClick={() => props.enviarAlStack(itemId)}>
                                        <FontAwesomeIcon icon={faHeart} style={{ color: "#e41b43", }} />
                                    </button>
                                    <button className="button" style={styleButtonItem} onClick={() => setModalEstado(true)}>
                                        <FontAwesomeIcon icon={faEye} style={{ color: "#277fdd" }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {
                props.tipo === "stack" &&
                <div className="columns">
                    <div className="column is-one-third" id="clickable">
                        <img
                            className="rounded object-cover img-hover"
                            src={props.item.pathImagen}
                            alt={props.item.idItem}
                            style={styleNotDragged} />
                        <br />
                    </div>
                    <div className="column">
                        <div className="columns">
                            <div className="column">
                                {props.item !== null &&
                                    <div>
                                        <p> <span className="has-text-weight-bold">{props.item.nombreItem} - </span> {props.item.nombre_autor} </p>
                                        {/*
                                        <p>{parseFloat(props.item.rating).toFixed(0)}</p>
                                    */}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="is-flex-direction-row">
                                    <button className="button" style={styleButtonItem} onClick={() => setDestinoEstado(true)}>
                                        <FontAwesomeIcon icon={faPeopleGroup} style={{ color: "#09b391" }} />
                                    </button>
                                    <button className="button" style={styleButtonItem} onClick={() => props.eliminarDelStack(props.idGrupo, itemId)}>
                                        <FontAwesomeIcon icon={faHeartBroken} style={{ color: "#e41b43", }} />
                                    </button>
                                    <button className="button" style={styleButtonItem} onClick={() => setModalEstado(true)}>
                                        <FontAwesomeIcon icon={faEye} style={{ color: "#277fdd" }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {
                modalEstado &&
                <ItemModal cambiarEstado={setModalEstado} estado={modalEstado} item={props.item} historial={false} enviarAlStack={props.enviarAlStack} idGrupo={props.idGrupo} idUsuario={props.idUsuario} />
            }
            <DestinatarioUsuarioModal socket={props.socket} cambiarEstado={setDestinoEstado} item={props.item} estado={destinoEstado} idGrupo={props.idGrupo} idUsuario={props.idUsuario} />
        </>
    )
}

export default TarjetaItem