import io from "socket.io-client"
import { Formik, Form, Field } from "formik"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const socket = io(process.env.REACT_APP_SOCKET_URL)

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const imagenEfecto = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    width: "100%",
    opacity: 0,
    transition: ".5s ease",
    backgroundColor: "#008CBA",
}

const Login = () => {
    const navigate = useNavigate()
    const [idSesion, setIdSesion] = useState("")
    const [imagen, setImagen] = useState("/home/asmith/web-librec/front-grouplibrec/src/images/user.png")

    const loginInterfaz = async (nombre) => {
        sessionStorage.setItem("id_sesion", idSesion)

        let info_usuario = {
            id_sesion: String(idSesion),
            nombre: nombre.nombre,
            imagen: imagen
        }
        try {
            await api.post("/login", info_usuario, {
                headers: {
                    "Content-type": "application/json"
                }
            })
            navigate("/index", { replace: true })
        }
        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        socket.on("sesion-usuario", (id) => {
            setIdSesion(id)
        })
    }, [socket])

    return (
        <div className="modal is-active">
            <div className="modal-card">
                <div className="columns">
                    <div className="column">
                        <h2>Seleccione su avatar</h2>
                        <div className="columns">
                            <div className="column">
                                <img src="http://192.168.1.10:8000/iconos/icono1.png" style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono1.png")} alt="user1" />
                            </div>
                            <div className="column">
                                <img src="http://192.168.1.10:8000/iconos/icono2.png" style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono2.png")} alt="user2" />
                            </div>
                            <div className="column">
                                <img src="http://192.168.1.10:8000/iconos/icono3.png" style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono3.png")} alt="user3" />
                            </div>
                            <div className="column">
                                <img src="http://192.168.1.10:8000/iconos/icono4.png" style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono4.png")} alt="user4" />
                            </div>
                            <div className="column">
                                <img src="http://192.168.1.10:8000/iconos/icono5.png" style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono5.png")} alt="user5" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <div className="modal-content">
                            <div className="box">
                                <Formik
                                    initialValues={{
                                        usuario: "",
                                        password: ""
                                    }}
                                    onSubmit={(nombre) => loginInterfaz(nombre)}>
                                    <Form>
                                        <div className="field">
                                            <label>Usuario</label>
                                        </div>
                                        <div className="field">
                                            <Field placeholder="Ingrese su usuario" className="input" type="text" name="nombre" />
                                        </div>
                                        <div className="field">
                                            <label>Contraseña</label>
                                        </div>
                                        <div className="field">
                                            <Field placeholder="Ingrese su contraseña" className="input" type="password" name="password" />
                                        </div>
                                        <div className="field">
                                            <button className="button is-primary" type="submit">Entrar</button>
                                        </div>
                                    </Form>
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
