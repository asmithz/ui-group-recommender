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
    const [nombreUsuario, setNombreUsuario] = useState("")

    useEffect(() => {
        if (!idSesion) {
            navigate("/ingresar", { replace: true })
        }
    }, [idSesion])

    useEffect(() => {
        obtenerSalas()
        obtenerNombreUsuario()
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

    const obtenerNombreUsuario = async () => {
        try {
            const resp = await api.get("/obtener-usuario-nombre", {
                params: { idUsuario },
                headers: {
                    "Content-type": "application/json"
                }
            }
            )
            if (resp) {
                setNombreUsuario(resp.data.usuario)
            }
        }
        catch (error) {
            console.log("error usuario")
        }
    }

    const abrirModalSala = (infoModal) => {
        setModalSalaEstado(true)
        setModalSalaInfo(infoModal)
    }

    const styleBorder = {
        border: "1px solid #000",
        borderRadius: 5
    }

    const styleButtonBorder = {
        border: "1px solid #000",
    }

    const checkSalaDisponible = async (event, idSala) => {
        event.preventDefault();
        try {
            const resp = await api.get("/check-sala-espacio-disponible", {
                params: {idSala},
                headers: {
                    "Content-type": "application/json"
                }
            }
            )
            if (resp.data.enter) {
                window.location.href = "/grupo/" + idSala;
            }
            else{
                window.alert("Max reached")
            }
        }
        catch (error) {
            console.log("error usuario")
        }
    }

    return (
        <section className="hero is-fullheight" style={{ paddingBottom: "20vh" }}>
            <div className="hero-body">
                <div className="container">
                    {
                        idSesion ? (
                            <div>
                                <NuevaSalaModal idSesion={idSesion} idUsuario={idUsuario} estado={modalSala} cambiarEstado={setModalSala} />
                                <div className="container">
                                    <p className="is-size-1 has-text-centered" style={{ paddingBottom: "2vh" }}>{t('main.title', { user: nombreUsuario })}</p>
                                </div>

                                <div className="columns" >
                                    <div className="column is-half is-offset-one-quarter" style={styleBorder}>
                                        <div className="container" style={{ paddingBottom: "2vh" }}>
                                            <p className="is-size-3 has-text-centered">{t('main.roomsTitle')}</p>
                                        </div>
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
                                                                    <td className="has-text-centered">{salaDisponible.usuarios_activos.length}/{salaDisponible.max_users}</td>
                                                                    <td className="has-text-justified">{salaDisponible.descripcion}</td>
                                                                    <td className="has-text-centered" >
                                                                        {/*
                                                                            <span className="icon-text has-text-info" onClick={() => abrirModalSala(salaDisponible)}>
                                                                                <button className="button is-info is-light is-rounded">
                                                                                    <FontAwesomeIcon icon={faInfo} />
                                                                                </button>
                                                                            </span>
                                                                        */}

                                                                        <p className="has-text-weight-bold has-text-success"> 
                                                                        {
                                                                            salaDisponible.estado === "open" &&
                                                                            t('main.table.state.open')
                                                                        }
                                                                        </p>
                                                                        <p className="has-text-weight-bold has-text-danger"> 
                                                                        {
                                                                            salaDisponible.estado === "closed" &&
                                                                            t('main.table.state.closed')
                                                                        }
                                                                        </p>
                                                                    </td>
                                                                    <td>
                                                                        <Link to={"/grupo/" + salaDisponible._id.toString()} onClick={(event) => checkSalaDisponible(event, salaDisponible._id.toString()) }>
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

                                    </div>
                                </div>
                                <div className="has-text-centered">
                                    <button className="button is-warning is-light is-rounded" onClick={obtenerSalas} style={styleButtonBorder}>
                                        <FontAwesomeIcon icon={faArrowsRotate} />
                                    </button>
                                    <span> </span>
                                    <button className="button is-primary is-light is-rounded" onClick={() => setModalSala(true)} style={styleButtonBorder}>{t('main.createRoom')}</button>
                                </div>
                                <InformacionSalaModal estado={modalSalaEstado} salaInfo={modalSalaInfo} cambiarEstado={setModalSalaEstado} />
                            </div>
                        ) :
                            (
                                <div>Acceso denegado</div>
                            )
                    }
                </div>
            </div>
        </section>
    )
}

export default Salas
