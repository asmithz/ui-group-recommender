import { useEffect, useState } from "react"
import axios from "axios"
import { Rating } from "react-simple-star-rating"
import Lottie from "lottie-react"
import checkMark from "../animations/check-mark.json"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faForward, faStar } from "@fortawesome/free-solid-svg-icons"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Calificar = (props) => {
    const [idPelicula, setIdPelicula] = useState("")
    const [imagen, setImagenPelicula] = useState("")
    const [nombrePelicula, setNombrePelicula] = useState("")
    const [tipoPelicula, setTipoPelicula] = useState("")
    const [puntuacion, setPuntuacion] = useState(1)
    const [calificar, setCalificar] = useState(0)
    const [peliculaCalificada, setPeliculaCalificada] = useState(false)
    const [cargando, setCargando] = useState(false)

    const cerrarCalificaciones = () => {
        props.cambiarEstado(false)
    }

    useEffect(() => {
        const mostrarPelicula = async () => {
            setPuntuacion(1)
            if(props.idUsuario){
                const pelicula = await api.get("/obtener-item", 
                { 
                    params: {
                        id_usuario: props.idUsuario 
                    }
                }, 
                {
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                setIdPelicula(pelicula.data.id_pelicula)
                setImagenPelicula(pelicula.data.imagen)
                setNombrePelicula(pelicula.data.nombre_pelicula)
                setTipoPelicula(pelicula.data.tipo_pelicula)
            }
        }
        mostrarPelicula()
    }, [calificar])

    const calificarPelicula = async () => {
        let calificacion = {
            id_usuario: props.idUsuario,
            id_item: idPelicula,
            rating: puntuacion
        }
        setPeliculaCalificada(true)
        try {
            await api.post("/calificar-item", calificacion)
        }
        catch (error) {
            console.log(error)
        }
    }

    const puntuacionPelicula = (valor_rating) => {
        setPuntuacion(valor_rating)
    }

    const saltarPelicula = () => {
        setCalificar(calificar + 1)
        setPuntuacion(1)
        setPeliculaCalificada(false)
    }

    const siguientePelicula = () => {
        setCalificar(calificar + 1)
        setPeliculaCalificada(false)
    }

    const styleModal = {
        backgroundColor: "white",
        padding: "50px",
        borderRadius: "10px"
    }

    return (
        <>
            {
                props.estado &&
                <div className={props.estado ? "modal is-active" : "modal"}>
                    <div className={props.estado ? "modal-background" : ""} onClick={() => props.cambiarEstado(false)}></div>
                    <div className="modal-content" style={styleModal}>
                            <p className="modal-card-title">Califique las películas que haya visto</p>
                            <br/>
                            <div className="columns">
                                <div className="column">
                                    <img src={imagen} alt={idPelicula} style={{ height: 500, width: 380, borderRadius: "10px" }} />
                                </div>
                                <div className="column">
                                    <div className="columns">
                                        <div className="column">
                                            <p>Titulo: {nombrePelicula}</p>
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            <p>Género: {tipoPelicula}</p>
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            <Rating
                                                onClick={puntuacionPelicula}
                                                initialValue={puntuacion}
                                            />
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            {
                                                peliculaCalificada &&
                                                <Lottie animationData={checkMark} loop={false} />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                !peliculaCalificada &&
                                <div className="columns has-text-centered">
                                    <div className="column">
                                        <button className="button is-info is-medium is-rounded" onClick={calificarPelicula}>
                                            <FontAwesomeIcon icon={faStar}/>
                                        </button>
                                    </div>
                                    <div className="column">
                                        <button className="button is-warning is-medium is-rounded" onClick={saltarPelicula}>
                                            <FontAwesomeIcon icon={faForward} />
                                        </button>
                                    </div>
                                </div>
                            }
                            {
                                peliculaCalificada &&
                                <div className="columns has-text-centered">
                                    <div className="column">
                                        <button className="button is-success is-medium is-rounded is-right" onClick={siguientePelicula}>
                                            <FontAwesomeIcon icon={faArrowRight}/>
                                        </button>
                                    </div>
                                </div>
                            }
                    </div>
                </div>
            }
        </>
    )
}

export default Calificar
