import { useDrag } from "react-dnd"
import "../css/StyleItemHover.css"

const TarjetaItem = (props) => {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "item",
        item: {
            id: props.item.idItem
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        })
    }))

    const styleDragged = {
        height: 150, 
        width: 90, 
        display: "inline-block",
        border: "5px solid #ff7171",
        borderRadius: "8%"
    }

    const styleNotDragged = {
        height: 150, 
        width: 90, 
        display: "inline-block",
        borderRadius: "8%"
    }

    return (
        <div className="column">
            <img
                ref={drag}
                className="rounded object-cover img-hover"
                src={props.item.pathImagen}
                alt={props.item.idItem}
                style={isDragging ? styleDragged : styleNotDragged} />
            <br />
            <p>{parseFloat(props.item.rating).toFixed(4)}</p>
        </div>
    )
}

export default TarjetaItem