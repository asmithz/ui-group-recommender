import { useEffect, useState } from "react"
import axios from "axios"
import SlidingPane from "react-sliding-pane"
import "react-sliding-pane/dist/react-sliding-pane.css"
import '../css/StyleAcordionHistorial.css'
import '../css/StyleItemHover.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faAnglesLeft } from "@fortawesome/free-solid-svg-icons"
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel
} from "react-accessible-accordion"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const PanelHistorialRecomendaciones = (props) => {
    const [itemsIndividual, setItemsIndividual] = useState([])
    const [itemsGrupal, setItemsGrupal] = useState([])
    const [panelIndividual, setPanelIndividual] = useState(false)
    const [panelGrupal, setPanelGrupal] = useState(false)

    const obtenerRecomendacionesIndividuales = async () => {
        try {
            const items = await api.get("/obtener-recomendaciones-usuario",
                {
                    params: {
                        idSala: props.idGrupo,
                        idUsuario: props.idUsuario
                    }
                },
                {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
            if (items) {
                setItemsIndividual(items.data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const obtenerRecomendacionesGrupales = async () => {
        try {
            const items = await api.get("/obtener-recomendaciones-grupo",
                {
                    params: {
                        idSala: props.idGrupo,
                    }
                },
                {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
            console.log(items)
            if (items) {
                console.log(items)
                setItemsGrupal(items.data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const abrirPanelIndividual = () => {
        obtenerRecomendacionesIndividuales()
        setPanelIndividual(true)
    }

    const abrirPanelGrupal = () => {
        obtenerRecomendacionesGrupales()
        setPanelGrupal(true)
    }

    return (
        <>
            {
                props.tipo === "individual" &&
                <>
                    <SlidingPane
                        isOpen={panelIndividual}
                        from="left"
                        onRequestClose={() => {
                            setPanelIndividual(false)
                        }}
                        width="800px"
                        hideHeader={true}
                    >
                        <div className="columns">
                            <div className="column">
                                <div>
                                    <p className="is-size-4 mb-5">
                                        Historial de sus recomendaciones
                                    </p>
                                    <div className="columns">
                                        <div className="column">
                                            {
                                                itemsIndividual.length > 0 &&
                                                itemsIndividual.map((recomendacion, index) => {
                                                    return <ItemsRecomendados recomendacion={recomendacion} key={index} index={index} />
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column has-text-right">
                                <button className="button is-danger is-light is-rounded" onClick={() => setPanelIndividual(false)}>
                                    <FontAwesomeIcon icon={faAnglesLeft} style={{ color: "#f47b7b" }} />
                                </button>
                            </div>
                        </div>
                    </SlidingPane>
                    <button className="button is-primary is-rounded is-light" onClick={abrirPanelIndividual}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </>
            }
            {
                props.tipo === "grupal" &&
                <>
                    <SlidingPane
                        isOpen={panelGrupal}
                        from="left"
                        onRequestClose={() => {
                            setPanelGrupal(false)
                        }}
                        width="800px"
                        hideHeader={true}
                    >
                        <div className="columns">
                            <div className="column">
                                <div>
                                    <p className="is-size-4 mb-5">
                                        Historial de recomendaciones de la sala
                                    </p>
                                    <div className="columns">
                                        <div className="column">
                                            {
                                                itemsGrupal.length > 0 &&
                                                itemsGrupal.map((recomendacion, index) => {
                                                    return <ItemsRecomendados recomendacion={recomendacion} key={index} index={index} />
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column has-text-right">
                                <button className="button is-danger is-light is-rounded" onClick={() => setPanelGrupal(false)}>
                                    <FontAwesomeIcon icon={faAnglesLeft} style={{ color: "#f47b7b" }} />
                                </button>
                            </div>
                        </div>
                    </SlidingPane>
                    <button className="button is-primary is-rounded is-light" onClick={abrirPanelGrupal}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </>
            }
        </>
    )
}

const ItemsRecomendados = (props) => {
    const convertirTiempo = (milisegundos) => {
        var date = new Date(milisegundos)
        var timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        timeString = timeString.replace(/( AM| PM)$/, '')
        var hours = date.getHours()
        var amOrPm = hours >= 12 ? 'PM' : 'AM'
        timeString += ' ' + amOrPm
        return timeString
    }

    return (
        <div className="columns">
            <div className="column">
                <Accordion allowZeroExpanded={true}>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Recomendación realizada a las {convertirTiempo(props.recomendacion.time)}
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            {props.recomendacion.items.map((item, index) => {
                                return <Item item={item} key={item.idItem + index} />
                            })}
                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}

const Item = (props) => {
    const [itemInfo, setItemInfo] = useState({})
    const obtenerItem = async () => {
        try {
            const itemInfo = await api.get("/obtener-item", { params: { idItem: props.item.idItem } }, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (itemInfo) {
                setItemInfo(itemInfo.data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        obtenerItem()
    }, [])

    return (
        <div className="columns">
            <div className="column">
                <img className="img-hover" src={itemInfo.pathItem} alt={itemInfo.idItem} />
            </div>
            <div className="column">
                <p className="has-text-weight-bold">{itemInfo.nombreItem}</p>
                <p>{itemInfo.tipoItem}</p>
            </div>
            <div className="column">
            </div>
        </div>
    )
}

export default PanelHistorialRecomendaciones