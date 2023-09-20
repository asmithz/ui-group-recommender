import HorizontalScroll from "react-horizontal-scrolling"
import TarjetaItem from "./TarjetaItem"

const ListaItems = (props) => {
    return (
        <>
            {
                props.recomendaciones.length > 0 &&
                props.recomendaciones.map((item, index) => {
                    return <TarjetaItem socket={props.socket} tipo={props.tipo} item={item} key={index} enviarAlStack={props.enviarAlStack} eliminarDelStack={props.eliminarDelStack} idGrupo={props.idGrupo} idUsuario={props.idUsuario} />
                })
            }
            {
                props.recomendaciones.length === 0 &&
                <p className="is-size-3">{props.tipo === "stack" ? <span>No favorites</span> : <span>No recommendations</span>}</p>
            }
        </>

    )
}

export default ListaItems