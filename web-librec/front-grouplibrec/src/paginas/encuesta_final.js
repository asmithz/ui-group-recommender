import { useParams } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMusic, faHeadphonesSimple } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"
import { Formik, Form, Field, ErrorMessage } from 'formik';

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
    const [usuariosSala, setSala] = useState([])

    const usersInitialValuesForm = {}

    const initialValuesForm = {
        question1: "",
        question2: usersInitialValuesForm,
        question3: "",
        question4: "",
        question5: "",
        question6: "",
        question7: "",
        question8: "",
        question9: "",
        question10: "",
        question11: "",
    }

    const questionStyle = {
        marginBottom: "20px"
    }

    const radioCheckStyle = {
        marginRight: "60px",
    }

    useEffect(() => {
        const obtener_consenso = async () => {
            try {
                const resp_consensus = await api_consensus.get("/consensus-group", { params: { idSala } })
                if (resp_consensus) {
                    //setConsensoItems(resp_consensus.data)
                    const ranking = Object.entries(resp_consensus.data.borda).sort(([, valueA], [, valueB]) => valueB - valueA);
                    const idItem = ranking[0][0]
                    const obtener_item = await api.get("/obtener-item", { params: { idItem } }, {
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                    if (obtener_item) {
                        setFinalItem(obtener_item.data)
                    }
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        const obtener_sala_usuarios = async () => {
            try {
                const idGrupo = idSala
                const sala = await api.get("/obtener-sala", { params: { idGrupo } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (sala) {
                    setSala(sala.data.sala_espera)
                }
            }
            catch (error) {
                console.log("Error al obtener usuarios ", error)
            }
        }
        obtener_sala_usuarios()
        obtener_consenso()
    }, [])

    const enviarCuestionario = (values) => {
        if (!values.question1 ||
            !values.question2 ||
            !values.question3 ||
            !values.question4 ||
            !values.question5 ||
            !values.question6 ||
            !values.question7 ||
            !values.question8 ||
            !values.question9 ||
            !values.question10
        ) {
            window.alert(`${t('main.questionnaire.questions.alert')}`)

        }
        else {
            console.log(values)
        }
    }

    return (
        <>
            <div className="container mt-6 has-text-centered">
                <p className="is-size-1" style={{ paddingBottom: 20 }}>{t('main.title')}:</p>
                <div className="box" style={{ paddingBottom: 50, paddingTop: 50, paddingLeft: 100, paddingRight: 100 }}>
                    <p className="is-size-3" style={{ paddingBottom: 20 }}><span>{finalItem.nombreItem}</span> - <span>{finalItem.nombre_autor}</span></p>
                    <div className="columns">
                        <div className="column">
                            <img src={finalItem.pathItem} alt={finalItem.idItem} style={{ height: 300, width: 400, borderRadius: "10px" }} />
                        </div>
                        <div className="column" style={{ paddingTop: 40 }}>
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
            </div>
            <div className="container mt-6 has-text-centered">
                <p className="is-size-1">{t('main.questionnaire.title')}</p>
            </div>
            <div className="container mt-6">
                <div className="box" style={{ paddingBottom: 50, paddingTop: 50, paddingLeft: 100, paddingRight: 100 }}>
                    <Formik
                        initialValues={initialValuesForm}
                        onSubmit={enviarCuestionario}
                    >
                        <Form>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">1. {t('main.questionnaire.questions.item.title')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question1" value="1" />
                                        <span> {t('main.questionnaire.options.1')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question1" value="2" />
                                        <span> {t('main.questionnaire.options.2')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question1" value="3" />
                                        <span> {t('main.questionnaire.options.3')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question1" value="4" />
                                        <span> {t('main.questionnaire.options.4')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question1" value="5" />
                                        <span> {t('main.questionnaire.options.5')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">2. {t('main.questionnaire.questions.collaboration.1')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    {
                                        Object.values(usuariosSala).map((user, index) => {
                                            if (user._id !== sessionStorage.getItem("id_usuario")) {
                                                initialValuesForm.question2[user.usuario] = 0
                                                return (
                                                    <div key={index + "2"}>
                                                        <div className="columns">
                                                            <div className="column has-text-right">
                                                                <label>{user.usuario}</label>
                                                            </div>
                                                            <div className="column has-text-left">
                                                                <div className="select is-small">
                                                                    <Field as="select" name={`question2.${user.usuario}`}>
                                                                        <option value="1">1</option>
                                                                        <option value="2">2</option>
                                                                        <option value="3">3</option>
                                                                        <option value="4">4</option>
                                                                        <option value="5">5</option>
                                                                    </Field>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ErrorMessage name={user} component="div" className="error" />
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">3. {t('main.questionnaire.questions.collaboration.2')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    {
                                        Object.values(usuariosSala).map((user, index) => {
                                            if (user._id !== sessionStorage.getItem("id_usuario")) {
                                                return (
                                                    <label style={radioCheckStyle} key={index + "3"}>
                                                        <Field type="radio" name="question3" value={user.usuario} />
                                                        <span> {user.usuario}</span>
                                                    </label>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">4. {t('main.questionnaire.questions.collaboration.3')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question4" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question4" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question4" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question4" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question4" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">5. {t('main.questionnaire.questions.collaboration.4')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question5" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question5" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question5" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question5" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question5" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">6. {t('main.questionnaire.questions.satisfaction.1')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question6" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question6" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question6" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question6" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question6" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">7. {t('main.questionnaire.questions.satisfaction.2')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question7" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question7" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question7" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question7" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question7" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">8. {t('main.questionnaire.questions.satisfaction.3')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question8" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question8" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question8" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question8" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question8" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">9. {t('main.questionnaire.questions.satisfaction.4')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question9" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question9" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question9" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question9" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question9" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">10. {t('main.questionnaire.questions.satisfaction.5')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question10" value="1" />
                                        <span> {t('main.questionnaire.options.disagreeStrong')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question10" value="2" />
                                        <span> {t('main.questionnaire.options.disagree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question10" value="3" />
                                        <span> {t('main.questionnaire.options.neutral')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question10" value="4" />
                                        <span> {t('main.questionnaire.options.agree')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question10" value="5" />
                                        <span> {t('main.questionnaire.options.agreeStrong')}</span>
                                    </label>
                                </div>
                            </div>
                            <div style={questionStyle}>
                                <label className="is-size-4 has-text-weight-bold">11. {t('main.questionnaire.questions.satisfaction.6')}</label>
                                <div className="is-size-5 has-text-centered options" style={{ marginTop: "20px" }}>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question11" value="favoritos" />
                                        <span> {t('main.questionnaire.options.favorites')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question11" value="sistema" />
                                        <span> {t('main.questionnaire.options.system')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question11" value="chat" />
                                        <span> {t('main.questionnaire.options.chat')}</span>
                                    </label>
                                    <label style={radioCheckStyle}>
                                        <Field type="radio" name="question11" value="historial" />
                                        <span> {t('main.questionnaire.options.history')}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="has-text-centered" style={{ marginTop: "50px" }}>
                                <button className="button is-primary is-rounded" type="submit">{t('main.button')}</button>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div >
        </>
    )
}

export default EncuestaFinal