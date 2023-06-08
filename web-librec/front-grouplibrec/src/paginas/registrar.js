import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Formik, Form, Field } from "formik"
import axios from "axios"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const api_url = process.env.REACT_APP_API_URL

const Registrar = () => {
    const navigate = useNavigate()

    const [imagenUsuario, setImagen] = useState("")

    const registrarUsuario = async (valores) => {
        try{
            // agregar la imagen seleccionada al json
            valores.imagen_usuario = imagenUsuario
            const resp = await api.post("/registrar-usuario", valores)
            if(resp){
                navigate("/ingresar", { replace: true })
            }
        }
        catch(error){
            console.log(error)
        }
    }

    return(
        <div className="columns">
            <div className="column is-half is-offset-one-quarter">
                <div>
                    <p className="is-size-1 has-text-centered">Registre su usuario en GroupLibrec</p>
                </div>
                <div>
                    <Formik
                        initialValues={{
                            usuario: "",
                            nombre: "",
                            imagen_usuario: "",
                            edad: "",
                            educacion: "",
                            password: "",
                            recomendaciones: []
                        }}
                        onSubmit={(valores) => registrarUsuario(valores)}>
                        <Form>
                            {/* Avatar */}
                            <div className="field">
                                <label className="label">Seleccione su avatar de usuario</label>
                            </div>
                        <div className="columns">
                            <div className="column">
                                <img src={api_url+"/iconos/icono1.png"} style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono1.png")} alt="user1" />
                            </div>
                            <div className="column">
                                <img src={api_url+"/iconos/icono2.png"} style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono2.png")} alt="user2" />
                            </div>
                            <div className="column">
                                <img src={api_url+"/iconos/icono3.png"} style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono3.png")} alt="user3" />
                            </div>
                            <div className="column">
                                <img src={api_url+"/iconos/icono4.png"} style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono4.png")} alt="user4" />
                            </div>
                            <div className="column">
                                <img src={api_url+"/iconos/icono5.png"} style={{ width: 100, height: 100 }} onClick={() => setImagen("http://192.168.1.10:8000/iconos/icono5.png")} alt="user5" />
                            </div>
                        </div>
                            {/* Nombre Usuario*/}
                            <div className="field">
                                <label className="label">Nombre de usuario</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese su nombre de usuario" className="input" type="text" name="usuario" />
                            </div>
                            {/* Nombre */}
                            <div className="field">
                                <label className="label">Nombre y apellido</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese su nombre" className="input" type="text" name="nombre" />
                            </div>
                            {/* Edad */}
                            <div className="field">
                                <label className="label">Edad</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese su edad" className="input" type="text" name="edad" />
                            </div>
                            {/* Trabajo */}
                            <div className="field">
                                <label className="label">A qué se dedica</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese profesión o estado educativo" className="input" type="text" name="educacion" />
                            </div>
                            {/* Contraseña */}
                            <div className="field">
                                <label className="label">Contraseña</label>
                            </div>
                            <div className="field">
                                <Field placeholder="Ingrese una contraseña" className="input" type="password" name="password" />
                            </div>
                            {/* Boton */}
                            <div className="field">
                                <button className="button is-primary" type="submit">Entrar</button>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    )

}

export default Registrar
