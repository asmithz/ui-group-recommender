import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { Formik, Form, Field, isInteger } from "formik"
import { useEffect, useState } from "react"
import axios from "axios"
import { useTranslation } from "react-i18next" 

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const NuevaSalaModal = (props) => {
    const { t, i18n } = useTranslation("componentes/nueva_sala_modal")

    const [usuarioLider, setUsuarioLider] = useState(null)

    useEffect(() => {
        const obtenerUsuarioLider = async (idUsuario) => {
            try {
                const resp = await api.get("/obtener-usuario", { params: { idUsuario } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if (resp) {
                    setUsuarioLider(resp.data.usuario)
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        obtenerUsuarioLider(props.idUsuario)
    }, [])

    const crearSala = async (datosSala) => {
        try {
            datosSala.lider = usuarioLider
            if (usuarioLider) {
                await api.post("/crear-sala", datosSala, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                props.cambiarEstado(false)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const styleModal = {
        backgroundColor: "white",
        padding: "50px",
        borderRadius: "10px"
    }

    return (
        <>
            {props.estado &&
                <div className={props.estado ? "modal is-active" : "modal"}>
                    <div className={props.estado ? "modal-background" : ""} onClick={() => props.cambiarEstado(false)}></div>
                    <div className="modal-content" style={styleModal}>
                        <section>
                            <p className="is-size-4 has-text-centered">{t('main.title')}</p>
                            <Formik
                                initialValues={{
                                    id_sala: props.idSesion,
                                    titulo: "",
                                    descripcion: "",
                                    lider: "",
                                    maxUsers: ""
                                }}
                                onSubmit={(datos) => {
                                    crearSala(datos)
                                }}
                                validate={datos => {
                                    const error = {}
                                    if (!datos.titulo) {
                                        error.titulo = `${t('main.alert.roomName')}`
                                    }
                                    if (!datos.descripcion) {
                                        error.descripcion = `${t('main.alert.description')}`
                                    }
                                    if (!datos.maxUsers) {
                                        if (Number(datos.maxUsers)){
                                            error.maxUsers = `${t('main.alert.maxUsersInteger')}`
                                        }
                                        error.maxUsers = `${t('main.alert.maxUsers')}`
                                    }
                                    else if (!Number(datos.maxUsers)) {
                                        error.maxUsers = `${t('main.alert.maxUsersInteger')}`
                                    }
                                    return error
                                }}>
                                {
                                    props => (
                                        <Form>
                                            <div className="field">
                                                <label className="label">{t('main.roomTitleName')}</label>
                                                {props.errors.titulo && <p className="help is-danger">{props.errors.titulo}</p>}
                                                <Field className={props.errors.titulo ? "input is-danger" : "input"} type="text" name="titulo" />
                                            </div>
                                            <div className="field">
                                                <div className="control">
                                                    <label className="label">{t('main.roomTitleDescription')}</label>
                                                    {props.errors.descripcion && <p className="help is-danger">{props.errors.descripcion}</p>}
                                                    <Field className={props.errors.descripcion ? "textarea is-danger" : "textarea"} name="descripcion" as="textarea" />
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">{t('main.roomTitleMaxUsers')}</label>
                                                {props.errors.maxUsers && <p className="help is-danger">{props.errors.maxUsers}</p>}
                                                <Field className={props.errors.maxUsers ? "input is-danger" : "input"} type="text" name="maxUsers" />
                                            </div>
                                            <div className="has-text-centered">
                                                <button className="button is-primary is-rounded is-hover is-light" type="submit">
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                        </Form>
                                    )
                                }
                            </Formik>
                        </section>
                    </div>
                </div>
            }
        </>
    )
}

export default NuevaSalaModal