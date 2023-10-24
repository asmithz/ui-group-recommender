import io from "socket.io-client"
import { Formik, Form, Field } from "formik"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Ingresar = () => {
    const { t, i18n } = useTranslation("paginas/ingresar")

    const [idSesion, setIdSesion] = useState("")
    const navigate = useNavigate()

    const loginInterfaz = async (valores) => {
        try{
            const resp = await api.post("/login-usuario", valores, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if (resp.data.respuesta === "ingreso"){
                sessionStorage.setItem("id_usuario", resp.data.usuario_id)
                socket.emit("generar-sesion", resp.data.usuario_id)
                let idUsuario = resp.data.usuario_id
                const usuario_sesion = await api.get("/obtener-sesion-usuario", { params: { idUsuario } }, {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                if(usuario_sesion){
                    sessionStorage.setItem("id_sesion", usuario_sesion.data.idSesion)
                }
                if (resp.data.test === "si"){
                    navigate("/test-personalidad", { replace: true })
                }
                else{
                    navigate("/salas", { replace: true })
                }
            }
            else{
                window.alert(`${t('main.alert.userpassError')}`)
            }
        }
        catch(error){
            console.log(error)
        }
    }

    socket.on("sesion-usuario", (id) => {
        setIdSesion(id)
    })

    const navegarCrearCuenta = () => {
        navigate("/registrar", { replace: false })
    }

    const loginStyle = {
        display: "flex",
        alignItems: "center",
        justifyItems: "center",
        height: "80vh",
        paddingLeft: "15%",
        marginLeft: "20%",
        marginRight: "20%",
    }

    const tarjetaLoginStyle = {
    }
    
    return(
        <div style={tarjetaLoginStyle}>
            <div className="columns" style={loginStyle}>
                <div className="column">
                    <p className="is-size-1 has-text-centered">{t('main.login.title')}</p>
                    <Formik
                        initialValues={{
                            usuario: "",
                            password: ""
                        }}
                        onSubmit={(valores) => loginInterfaz(valores)}
                        validate={datos => {
                                    const error = {}
                                    if (!datos.usuario) {
                                        error.usuario = `${t('main.login.userError')}`
                                    }
                                    if (!datos.password) {
                                        error.password = `${t('main.login.passwordError')}`
                                    }
                                    return error
                                }}
                        >
                    {
                        props => (
                        <Form>
                            <div className="field">
                                <label className="has-text-weight-bold">{t('main.login.userTitle')}</label>
                            </div>
                            <div className="field">
                                {props.errors.usuario && <p className="help is-danger">{props.errors.usuario}</p>}
                                <Field placeholder={t('main.login.userPlaceHolder')} className={props.errors.usuario ? "input is-danger is-rounded" : "input is-rounded"} type="text" name="usuario" />
                            </div>
                            <div className="field">
                                <label className="has-text-weight-bold">{t('main.login.passwordTitle')}</label>
                            </div>
                            <div className="field">
                                {props.errors.password && <p className="help is-danger">{props.errors.password}</p>}
                                <Field placeholder={t('main.login.passwordPlaceHolder')}  className={props.errors.password ? "input is-danger is-rounded" : "input is-rounded"} type="password" name="password" />
                            </div>
                            <div className="field has-text-centered">
                                <button className="button is-primary is-rounded pl-6 pr-6" type="submit">{t('main.login.button')}</button>
                            </div>
                        </Form>
                        )
                    }

                    </Formik>
                    <div className="column has-text-centered">
                    {t('main.footer.noAccount')} <a onClick={navegarCrearCuenta}>{t('main.footer.createAccountLink')}</a>
                    </div>
                </div>
                <div className="column">
                    <div style={{ fontSize: "10rem", color: "#09b391"}}>
                        <FontAwesomeIcon icon={faPeopleGroup} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Ingresar 
