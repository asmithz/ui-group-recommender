import { useParams } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"

const api_consensus = axios.create({
    baseURL: process.env.REACT_APP_API_CONSENSUS_URL
})

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const EncuestaFinal = () => {
    const idSala = useParams().id
    const [consensoItems, setConsensoItems] = useState({})
    const [finalItem, setFinalItem] = useState({})

    useEffect(() => {
        const obtener_consenso = async () => {
            try{
                const resp_consensus = await api_consensus.get("/consensus-group", { params: { idSala } })
                if (resp_consensus){
                    setConsensoItems(resp_consensus.data)
                    const ranking = Object.entries(resp_consensus.data.borda).sort(([, valueA], [, valueB]) => valueB - valueA);
                    const idItem = ranking[0]
                    const obtener_item = await api.get("/obtener-item", { params: { idItem } }, {
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                    if (obtener_item){
                        setFinalItem(obtener_item.data)
                    }
                }               
            }
            catch(error){
                console.log(error)
            }
        }
        obtener_consenso()
    }, [])

    return (
        <div>
            <h1>Test</h1>
            <p>{finalItem.nombreItem}</p>
        </div>
    )
}

export default EncuestaFinal