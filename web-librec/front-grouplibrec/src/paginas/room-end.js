import { useTranslation } from "react-i18next"
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link, useNavigate } from "react-router-dom"

const RoomEnd = () => {
    const { t, i18n } = useTranslation("paginas/room-end")
    const navigate = useNavigate()

    const salirGrupo = () => {
        navigate(`/salas`)
    }

    return (
        <div>
            <div className="container has-text-centered pt-5 pb-5">
                <h1 className="is-size-1 has-text-weight-bold">{t('main.titulo')}</h1>
            </div>
            <div className="container has-text-centered pt-5" style={{ paddingBottom: "100px" }}>
                <h2 className="is-size-2">{t('main.texto')}</h2>
            </div>
            <div className="container has-text-centered pt-5" style={{ paddingBottom: "300px" }}>
                <Link to="/salas">
                    <button className="button is-warning is-large is-right is-rounded" onClick={salirGrupo}>
                        <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    </button>
                </Link>
            </div>
        </div>
    )
}
export default RoomEnd