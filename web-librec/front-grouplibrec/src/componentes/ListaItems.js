import TarjetaItem from "./TarjetaItem"
import { useTranslation } from "react-i18next"

const ListaItems = (props) => {
    const { t, i18n } = useTranslation("componentes/lista_items")

    return (
        <>
            {
                props.recomendaciones.length > 0 &&
                props.recomendaciones.map((item, index) => {
                    return <TarjetaItem abierto={props.tipo} socket={props.socket} tipo={props.tipo} item={item} key={index} enviarAlStack={props.enviarAlStack} eliminarDelStack={props.eliminarDelStack} idGrupo={props.idGrupo} idUsuario={props.idUsuario} />
                })
            }
            {
                props.recomendaciones.length === 0 &&
                <p className="is-size-3">{props.tipo === "stack" ? <span>{t('main.favoritesStatus')}</span> : <span>{t('main.recommendationStatus')}</span>}</p>
            }
        </>

    )
}

export default ListaItems