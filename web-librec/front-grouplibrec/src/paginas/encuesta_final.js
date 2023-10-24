import { useParams } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMusic, faHeadphonesSimple } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"

const api_consensus = axios.create({
    baseURL: process.env.REACT_APP_API_CONSENSUS_URL
})

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const EncuestaFinal = () => {
    const { t, i18n } = useTranslation("paginas/encuesta_final")

    const idSala = useParams().id
    const [consensoItems, setConsensoItems] = useState({})
    const [finalItem, setFinalItem] = useState({})

    useEffect(() => {
        const obtener_consenso = async () => {
            try {
                const resp_consensus = await api_consensus.get("/consensus-group", { params: { idSala } })
                if (resp_consensus) {
                    setConsensoItems(resp_consensus.data)
                    console.log(consensoItems)
                    const ranking = Object.entries(resp_consensus.data.borda).sort(([, valueA], [, valueB]) => valueB - valueA);
                    const idItem = ranking[0][0]
                    const obtener_item = await api.get("/obtener-item", { params: { idItem } }, {
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                    if (obtener_item) {
                        setFinalItem(obtener_item.data)
                        console.log(obtener_item.data)
                    }
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        obtener_consenso()
    }, [])

    return (
        <div className="container mt-6 has-text-centered">
            <p className="is-size-1" style={{paddingBottom: 20}}>{t('main.title')}:</p>
            <div className="box" style={{paddingBottom: 50, paddingTop: 50, paddingLeft: 100, paddingRight: 100}}> 
                <p className="is-size-3" style={{paddingBottom: 20}}><span>{finalItem.nombreItem}</span> - <span>{finalItem.nombre_autor}</span></p>
                <div className="columns">
                    <div className="column">
                        <img src={finalItem.pathItem} alt={finalItem.idItem} style={{ height: 300, width: 400, borderRadius: "10px" }} />
                    </div>
                    <div className="column" style={{paddingTop: 40}}>
                        <div className="columns">
                            <div className="column">
                                <p className="is-size-4">{t('main.item.genre')}: {finalItem.tipoItem}</p>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <p className="is-size-4">{t('main.item.origin')}: {finalItem.origin_autor} - {finalItem.continent_autor}</p>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <a className="is-size-4" href={finalItem.url_item} target="_blank"><FontAwesomeIcon icon={faMusic} /> {t('main.item.clickToListen')} <FontAwesomeIcon icon={faMusic} /> </a>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <a className="is-size-4" href={finalItem.url_autor} target="_blank"><FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> {t('main.item.viewMore')} <FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="is-size-1">{t('main.questionnarie.title')}</p>
        </div>
    )
}

export default EncuestaFinal