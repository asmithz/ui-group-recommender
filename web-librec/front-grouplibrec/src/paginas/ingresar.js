import io from "socket.io-client"
import { Formik, Form, Field } from "formik"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

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
                navigate("/salas", { replace: true })
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
        navigate("/registrar", { replace: true })
    }

    const loginStyle = {
        display: "flex",
        alignItems: "center",
        justifyItems: "center",
        height: "80vh"
    }

    useEffect(() => {
        console.log(idSesion)
    })
    
    return(
        <div>
            <div className="columns" style={loginStyle}>
                <div className="column is-half is-offset-one-quarter">
                        <div className="column">
                            <p className="is-size-1 has-text-centered">GroupLibrec</p>
                        </div>
                    <Formik
                        initialValues={{
                            usuario: "",
                            password: ""
                        }}
                        onSubmit={(valores) => loginInterfaz(valores)}>
                        <Form>
                            <div className="field">
                                <label>Usuario</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese su usuario" className="input" type="text" name="usuario" />
                            </div>
                            <div className="field">
                                <label>Contraseña</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese su contraseña" className="input" type="password" name="password" />
                            </div>
                            <div className="field has-text-centered">
                                <div className="columns">
                                    <div className="column">
                                        <button className="button is-primary" type="submit">Entrar</button>
                                    </div>
                                    <div className="column">
                                        <a onClick={navegarCrearCuenta}>Crear cuenta</a>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    )
}

export default Ingresar 
