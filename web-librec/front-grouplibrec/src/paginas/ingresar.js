import io from "socket.io-client"
import { Formik, Form, Field } from "formik"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Ingresar = () => {
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
                sessionStorage.setItem("id_sesion", idSesion)
                sessionStorage.setItem("id_usuario", resp.data.usuario_id)
                socket.emit("generar-sesion", idSesion, resp.data.usuario_id)
                if (resp.data.test === "si"){
                    navigate("/test-personalidad", { replace: true })
                }
                else{
                    navigate("/salas", { replace: true })
                }
            }
            else{
                window.alert("Usuario o contraseña equivocada")
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
                    <p className="is-size-1 has-text-centered">Log in</p>
                    <Formik
                        initialValues={{
                            usuario: "",
                            password: ""
                        }}
                        onSubmit={(valores) => loginInterfaz(valores)}
                        validate={datos => {
                                    const error = {}
                                    if (!datos.usuario) {
                                        error.usuario = "Debe indicar su usuario"
                                    }
                                    if (!datos.password) {
                                        error.password = "Debe indicar su contraseña"
                                    }
                                    return error
                                }}
                        >
                    {
                        props => (
                        <Form>
                            <div className="field">
                                <label className="has-text-weight-bold">User</label>
                            </div>
                            <div className="field">
                                {props.errors.usuario && <p className="help is-danger">{props.errors.usuario}</p>}
                                <Field placeholder="Ingrese su usuario" className={props.errors.usuario ? "input is-danger is-rounded" : "input is-rounded"} type="text" name="usuario" />
                            </div>
                            <div className="field">
                                <label className="has-text-weight-bold">Password</label>
                            </div>
                            <div className="field">
                                {props.errors.password && <p className="help is-danger">{props.errors.password}</p>}
                                <Field placeholder="Ingrese su contraseña" className={props.errors.password ? "input is-danger is-rounded" : "input is-rounded"} type="password" name="password" />
                            </div>
                            <div className="field has-text-centered">
                                <button className="button is-primary is-rounded pl-6 pr-6" type="submit">Log in</button>
                            </div>
                        </Form>
                        )
                    }

                    </Formik>
                    <div className="column has-text-centered">
                    No account? <a onClick={navegarCrearCuenta}>Create account</a>
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
