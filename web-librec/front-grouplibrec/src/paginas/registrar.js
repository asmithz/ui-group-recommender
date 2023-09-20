import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Formik, Form, Field, replace } from "formik"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Registrar = () => {
    const navigate = useNavigate()
    const [imagenUsuario, setImagen] = useState()
    const [nombreImagen, setNombreImagen] = useState("")
    const [seleccionImagen, setFileImagen] = useState()
    const [preview, setPreview] = useState()
    const MAX_IMAGE_WIDTH = 300
    const MAX_IMAGE_HEIGHT = 300
    const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg"]

    const registrarUsuario = async (valores) => {
        // agregar la imagen seleccionada al json
        valores.imagen_usuario = seleccionImagen
        try {
            const resp = await api.post("/registrar-usuario", valores, {
                headers: {"Content-Type": "multipart/form-data"}
            })
            if (resp) {
                navigate("/ingresar", { replace: true })
                //navigate("/test-personalidad", { replace: true })
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const onSelectFile = e => {
        if (!e.target.files || e.target.files.length === 0) {
            setFileImagen(undefined)
            return
        }

        const selectedFile = e.target.files[0]
        const fileType = selectedFile.type

        if (!ACCEPTED_IMAGE_TYPES.includes(fileType)) {
            // Handle the case when the file type is not accepted
            alert('Solo se aceptan imagenes JPG y PNG.');
            return;
        }

        const image = new Image()

        image.onload = function () {
            if (this.width > MAX_IMAGE_WIDTH || this.height > MAX_IMAGE_HEIGHT) {
                // Handle the case when the image dimensions exceed the maximum limits
                window.alert('Largo de imagen exedido.')
                return
            }
        }

        setFileImagen(selectedFile)
        setNombreImagen(selectedFile.name)
    }

    useEffect(() => {
        if (!seleccionImagen) {
            setPreview(undefined)
            return
        }
        const objectUrl = URL.createObjectURL(seleccionImagen)
        setPreview(objectUrl)
        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)

    }, [seleccionImagen])

    const registrarStyle = {
        alignItems: "center",
        justifyItems: "center",
        marginTop: "5%",
        marginLeft: "25%",
        marginRight: "25%",
    }

    const containerStyleImage = {
        width: "200px",
        heigth: "200px",
        overflow: "hidden"
    }

    const imagePreviewStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    }

    return (
        <div style={registrarStyle}>
            <div>
                <div>
                    <p className="is-size-1 has-text-centered">Register</p>
                </div>
                <Formik
                    initialValues={{
                        usuario: "",
                        nombre: "",
                        imagen_usuario: seleccionImagen,
                        edad: "",
                        educacion: "",
                        password: "",
                        recomendaciones: []
                    }}
                    onSubmit={(valores) => registrarUsuario(valores)}>
                    <Form>
                        <div className="columns">
                            <div className="column">
                                {/* Nombre Usuario*/}
                                <div className="field">
                                    <label className="label">You new user name</label>
                                </div>
                                <div className="field">
                                    <Field placeholder="Ingrese su nombre de usuario" className="input is-rounded" type="text" name="usuario" />
                                </div>
                            </div>
                            <div className="column">
                                {/* Nombre */}
                                <div className="field">
                                    <label className="label">Your full name</label>
                                </div>
                                <div className="field">
                                    <Field placeholder="Ingrese su nombre" className="input is-rounded" type="text" name="nombre" />
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                {/* Edad */}
                                <div className="field">
                                    <label className="label">How old are you?</label>
                                </div>
                                <div className="field">
                                    <Field placeholder="Ingrese su edad" className="input is-rounded" type="text" name="edad" />
                                </div>
                            </div>
                            <div className="column">
                                {/* Trabajo */}
                                <div className="field">
                                    <label className="label">What's your education/profession?</label>
                                </div>
                                <div className="field">
                                    <Field placeholder="Ingrese profesión o estado educativo" className="input is-rounded" type="text" name="educacion" />
                                </div>
                            </div>
                        </div>
                        {/* Avatar */}
                        <div className="field">
                            <label className="label">Add your avatar</label>
                            <div className="columns">
                                <div className="column">
                                    <div className="file has-name is-fullwidth">
                                        <label className="file-label">
                                            <Field className="file-input" type="file" onChange={onSelectFile} name="imagen_usuario" />
                                            <span className="file-cta">
                                                <span className="file-icon">
                                                    <FontAwesomeIcon icon={faUpload} />
                                                </span>
                                                <span className="file-label">
                                                    Upload your avatar…
                                                </span>
                                            </span>
                                            {
                                                nombreImagen !== "" &&
                                                <span className="file-name has-text-centered" style={{ backgroundColor: "white" }}>
                                                    {nombreImagen}
                                                </span>
                                            }
                                        </label>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="has-text-centered">
                                        <div style={containerStyleImage}>
                                            {nombreImagen &&
                                                <img src={preview} style={imagePreviewStyle} />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Contraseña */}
                        <div className="field">
                            <label className="label">Password</label>
                        </div>
                        <div className="field">
                            <Field placeholder="Ingrese una contraseña" className="input is-rounded" type="password" name="password" />
                        </div>
                        {/* Boton */}
                        <div className="field has-text-centered">
                            <button className="button is-primary is-rounded pl-6 pr-6" type="submit">Register</button>
                        </div>
                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default Registrar
