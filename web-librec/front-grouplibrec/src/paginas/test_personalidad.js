import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const TestPersonalidad = () => {
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
            try {
                const response = await api.get("/obtener-test-personalidad")
                if (response.data) {
                    setPreguntas(response.data.preguntas)
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        obtenerPreguntas()
    }, [])

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-1 has-text-centered">Personality test</p>
                </div>
            </div>
            <div className="box">
                <div className="columns">
                    <div className="column">
                        <div className="block">
                            <p className="is-size-4 has-text-centered has-text-justified">Instructions</p>
                            <p className="is-size-6 has-text-centered has-text-justified">
                                The purpose of the Big Five personality test is to provide an objective description
                                of an individual's personality traits in relation to these five dimensions:
                                <span className="has-text-weight-bold"> Extraversion</span>, <span className="has-text-weight-bold"> Empathy</span>, <span className="has-text-weight-bold"> Neuroticism</span>, <span className="has-text-weight-bold"> Conscientiousness</span> and <span className="has-text-weight-bold"> Openness to Experience</span> .
                                Describe yourself honestly and as you generally are now, not as you wish to be in the future.
                                Indicate for each statement if you are:
                            </p>
                            <br />
                            <p>1. Strongly Disagree</p>
                            <p>2. Disagree</p>
                            <p>3. Neutral</p>
                            <p>4. Agree</p>
                            <p>5. Strongly Agree</p>
                        </div>
                        <div className="block">
                            <p className="is-size-4 has-text-centered has-text-justified">Questionnaire</p>
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
                        <button onClick={handleRetrieveValues}>Retrieve Values</button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default TestPersonalidad