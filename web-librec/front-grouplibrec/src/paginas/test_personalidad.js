import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useTranslation } from "react-i18next"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const TestPersonalidad = () => {
    const { t, i18n } = useTranslation("paginas/test_personalidad")
    //const [extroversion, setExtroversion] = useState(0)
    //const [emotional, setEmotional] = useState(0)
    //const [agreeableness, setAgreeableness] = useState(0)
    //const [conscientiousness, setConscientiousness] = useState(0)
    //const [imagination, setImagination] = useState(0)
    const navigate = useNavigate()
    const [preguntas, setPreguntas] = useState([])
    const [respuestas, setRespuestas] = useState([])
    const idUsuario = sessionStorage.getItem("id_usuario")

    const handleChange = (index, id, value, factor, keyed) => {
        // Clone the array to avoid directly modifying the state
        const updatedSelectedValues = [...respuestas]
        updatedSelectedValues[index] = { "pregunta": id, "respuesta": value, "factor": factor, "keyed": keyed};
        setRespuestas(updatedSelectedValues)
    }

    const respuestasCheck = (respuestas) => {
        for (let resp = 0; resp < respuestas.length; resp++) {
            if (respuestas[resp] === undefined) {
                return false
            }
        }
        return true
    }

    const handleRetrieveValues = async () => {
        const idUser = 1
        if (respuestas.length === 50 && respuestasCheck(respuestas)) {
            try {
                const request = {
                    respuestas: respuestas,
                    idUsuario: idUsuario
                }
                const resp = await api.post("/generar-personalidad", (request), {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (resp) {
                    console.log("perfil creado")
                    navigate("/test-perfil", { replace: true })
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        else {
            alert("Debe contestar todo el cuestionario")
        }
    }

    useEffect(() => {
        const obtenerPreguntas = async () => {
            const currentLang = i18n.language
            try {
                const response = await api.get("/obtener-test-personalidad", {
                    params: {currentLang}
                })
                if (response.data) {
                    setPreguntas(response.data.preguntas)
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        obtenerPreguntas()
    }, [i18n.language, idUsuario])

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-1 has-text-centered">{t('main.title')}</p>
                </div>
            </div>
            <div className="box" style={{ border: "1px solid #000"}}>
                <div className="columns">
                    <div className="column">
                        <div className="block">
                            <p className="is-size-4 has-text-centered has-text-justified">{t('main.subtitle')}</p>
                            <p className="is-size-6 has-text-centered has-text-justified">
                                {t('main.instructions1')}
                                <span className="has-text-weight-bold"> {t('main.dimensionExtraversion')}</span>, <span className="has-text-weight-bold"> {t('main.dimensionEmpathy')}</span>, <span className="has-text-weight-bold"> {t('main.dimensionNeuroticism')}</span>, <span className="has-text-weight-bold"> {t('main.dimensionConscientiousness')}</span> {t('main.and')} <span className="has-text-weight-bold"> {t('main.dimensionExperience')}</span>. 
                                {t('main.instructions2')}
                            </p>
                            <br />
                            <p>1. {t('main.agreement.strongDisagree')}</p>
                            <p>2. {t('main.agreement.disagree')}</p>
                            <p>3. {t('main.agreement.neutral')}</p>
                            <p>4. {t('main.agreement.agree')}</p>
                            <p>5. {t('main.agreement.strongAgree')}</p>
                        </div>
                        <div className="block">
                            <p className="is-size-4 has-text-centered has-text-justified">{t('main.questionnaireTitle')}</p>
                        </div>
                        {
                            preguntas.length > 0 &&
                            preguntas.map((pregunta, index) => {
                                return <div key={index}>
                                    <div className="columns">
                                        <div className="column">
                                            <p className="is-size-6 has-text-weight-bold">
                                                {pregunta.id_statement}. <span>  </span> {pregunta.statement}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="columns has-text-centered">
                                            <div className="column">
                                                <label className="radio">
                                                    <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)" }}>1</span>
                                                    <input type="radio" name={index} value={pregunta.keyed === "+" ? 1 : 5} onChange={(e) => handleChange(index, pregunta.id_statement, e.target.value, pregunta.factor, pregunta.keyed)} />
                                                </label>
                                            </div>
                                            <div className="column">
                                                <label className="radio">
                                                    <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)" }}>2</span>
                                                    <input type="radio" name={index} value={pregunta.keyed === "+" ? 2 : 4} onChange={(e) => handleChange(index, pregunta.id_statement, e.target.value, pregunta.factor, pregunta.keyed)} />
                                                </label>
                                            </div>
                                            <div className="column">
                                                <label className="radio">
                                                    <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)" }}>3</span>
                                                    <input type="radio" name={index} value={pregunta.keyed === "+" ? 3 : 3} onChange={(e) => handleChange(index, pregunta.id_statement, e.target.value, pregunta.factor, pregunta.keyed)} />
                                                </label>
                                            </div>
                                            <div className="column">
                                                <label className="radio">
                                                    <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)" }}>4</span>
                                                    <input type="radio" name={index} value={pregunta.keyed === "+" ? 4 : 2} onChange={(e) => handleChange(index, pregunta.id_statement, e.target.value, pregunta.factor, pregunta.keyed)} />
                                                </label>
                                            </div>
                                            <div className="column">
                                                <label className="radio">
                                                    <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)" }}>5</span>
                                                    <input type="radio" name={index} value={pregunta.keyed === "+" ? 5 : 1} onChange={(e) => handleChange(index, pregunta.id_statement, e.target.value, pregunta.factor, pregunta.keyed)} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                        <div className="has-text-centered" style={{ paddingTop: 40}}>
                            <button className="button is-primary is-rounded" onClick={handleRetrieveValues}>{t('main.button')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default TestPersonalidad