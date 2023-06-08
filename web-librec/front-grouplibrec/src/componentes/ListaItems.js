import HorizontalScroll from "react-horizontal-scrolling"
import TarjetaItem from "./TarjetaItem"

const ListaItems = (props) => {
    return (
        <>
            <HorizontalScroll style={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
                {
                    props.recomendaciones.length > 0 &&
                    props.recomendaciones.map((item, index) => {
                        return <TarjetaItem item={item} key={index} />
                    })
                }
            </HorizontalScroll>
            {
                props.recomendaciones.length === 0 &&
                <p className="is-size-3">No hay recomendaciones</p>
            }
        </>

    )
}

export default ListaItems