import { useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import NuevaSalaModal from "../componentes/NuevaSalaModal"
import InformacionSalaModal from "../componentes/InformacionSalaModal"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDoorOpen, faInfo, faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const Salas = () => {
    const { t, i18n } = useTranslation("paginas/salas")

    const [salas, setSalas] = useState([])
    const idSesion = sessionStorage.getItem("id_sesion") !== null //booleano
    const idUsuario = sessionStorage.getItem("id_usuario")
    const [modalSala, setModalSala] = useState(false)
    const [modalSalaEstado, setModalSalaEstado] = useState(false)
    const [modalSalaInfo, setModalSalaInfo] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        if (!idSesion) {
            navigate("/ingresar", { replace: true })
        }
    }, [idSesion])

    useEffect(() => {
        obtenerSalas()
    }, [])

    const obtenerSalas = async () => {
        try {
            const resp = await api.get("/obtener-salas")
            setSalas(resp.data)
        }
        catch (error) {
            console.log("error al ver las salas")
        }
    }

    const abrirModalSala = (infoModal) => {
        setModalSalaEstado(true)
        setModalSalaInfo(infoModal)
    }

    return (
        <>
            {
                idSesion ? (
                    <div>
                        <NuevaSalaModal idSesion={idSesion} idUsuario={idUsuario} estado={modalSala} cambiarEstado={setModalSala} />
                        <div className="container">
                            <div className="columns">
                                <div className="column">
                                    <p className="is-size-1 has-text-centered">{t('main.title')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="columns">
                                <div className="column">
                                    <p className="is-size-3 has-text-centered">{t('main.roomsTitle')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column is-half is-offset-one-quarter">
                                <table className="table is-rounded">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "160px" }}>{t('main.table.roomName')}</th>
                                            <th style={{ width: "100px" }}>{t('main.table.leaderName')}</th>
                                            <th style={{ width: "50px" }}>{t('main.table.availableUsers')}</th>
                                            <th style={{ width: "300px" }}>{t('main.table.description')}</th>
                                            <th className="has-text-centered">{t('main.table.more')}</th>
                                            <th className="has-text-centered">{t('main.table.enter')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            salas.length > 0 ? (
                                                salas.map((salaDisponible, salaIndex) => {
                                                    return (
                                                            <tr key={"tabla" + salaDisponible + salaIndex}>
                                                                <th>{salaDisponible.titulo}</th>
                                                                <td>{salaDisponible.lider}</td>
                                                                <td className="has-text-centered">{salaDisponible.usuarios_activos.length}/4</td>
                                                                <td className="has-text-justified">{salaDisponible.descripcion}</td>
                                                                <td className="has-text-centered" >
                                                                    <span className="icon-text has-text-info" onClick={() => abrirModalSala(salaDisponible)}>
                                                                        <button className="button is-info is-light is-rounded">
                                                                            <FontAwesomeIcon icon={faInfo} />
                                                                        </button>
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Link to={"/grupo/" + salaDisponible._id.toString()}>
                                                                        <button className="button is-primary is-light is-rounded">
                                                                            <FontAwesomeIcon icon={faDoorOpen} />
                                                                        </button>
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                    )
                                                })
                                            ) : (<></>)
                                        }
                                    </tbody>
                                </table>
                                <div className="has-text-centered">
                                    <button className="button is-warning is-light is-rounded" onClick={obtenerSalas}>
                                        <FontAwesomeIcon icon={faArrowsRotate} />
                                    </button>
                                    <button className="button is-primary is-light is-rounded" onClick={() => setModalSala(true)}>{t('main.createRoom')}</button>
                                </div>
                            </div>
                        </div>
                        <InformacionSalaModal estado={modalSalaEstado} salaInfo={modalSalaInfo} cambiarEstado={setModalSalaEstado} />
                    </div>
                ) :
                    (
                        <div>Acceso denegado</div>
                    )
            }
        </>
    )
}

export default Salas
