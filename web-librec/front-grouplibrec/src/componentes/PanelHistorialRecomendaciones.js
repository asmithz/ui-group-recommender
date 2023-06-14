import { useState } from "react"
import axios from "axios"
import SlidingPane from "react-sliding-pane"
import "react-sliding-pane/dist/react-sliding-pane.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faAnglesLeft } from "@fortawesome/free-solid-svg-icons"
import { 
    Accordion, 
    AccordionItem, 
    AccordionItemHeading, 
    AccordionItemButton, 
    AccordionItemPanel } from "react-accessible-accordion"
import 'react-accessible-accordion/dist/fancy-example.css'

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const PanelHistorialRecomendaciones = (props) => {
    const [panelIndividual, setPanelIndividual] = useState(false)
    const [itemsIndividual, setItemsIndividual] = useState([])
    const [panelGrupal, setPanelGrupal] = useState(false)

    const obtenerRecomendacionesIndividuales = async () => {
        try{
            const items = await api.get("/obtener-recomendaciones-usuario", 
                {   params: {
                        idSala: props.idGrupo,
                        idUsuario: props.idUsuario
                    }
                },
                {   headers: {
                        "Content-type": "application/json"
                    }
                })
                if(items){
                    setItemsIndividual(items.data)
                }
        }
        catch(error){
            console.log(error)
        }
    }

    const abrirPanelIndividual = () => {
        obtenerRecomendacionesIndividuales()
        setPanelIndividual(true)
    }

    return(
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
                            {
                                props.tipo === "individual" ?
                                <div>
                                    <p className="is-size-4">
                                        Historial de sus recomendaciones
                                    </p>
                                    <div className="columns">
                                        <div className="column">
                                            { itemsIndividual.map((recomendacion, index) => {
                                                return <ItemsRecomendados recomendacion={recomendacion} key={index} />
                                            }) }
                                        </div>
                                    </div>
                                </div>
                                    :
                                <div>
                                    <p className="is-size-4">
                                        Historial de las recomendaciones del grupo
                                    </p>
                                    <div className="columns">
                                        <div className="column">

                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="column has-text-right">
                            <button className="button is-danger is-light is-rounded" onClick={() => setPanelIndividual(false)}>
                                <FontAwesomeIcon icon={faAnglesLeft}  style={{ color: "#f47b7b" }}/>
                            </button>
                        </div>
                    </div>
                </SlidingPane>
                <button className="button is-primary is-rounded is-light" onClick={abrirPanelIndividual}>
                    <FontAwesomeIcon icon={faMagnifyingGlass}/>
                </button>
            </>
        }
        </>
    )
}

const ItemsRecomendados = (props) => {
    console.log(props.recomendacion.items)
    return(
        <div className="columns">
            <div className="column">
                <Accordion allowZeroExpanded={true}>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                <p>{props.recomendacion.time}</p>
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            {props.recomendacion.items.map((item, index) => {
                                return <Item item={item} key={item.idItem+index} />
                            } )}
                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}

const Item = (props) => {
    return(
        <p>{props.item.idItem}</p>
    )
}

export default PanelHistorialRecomendaciones