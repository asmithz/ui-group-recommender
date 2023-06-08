import { useDrag } from "react-dnd"

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
        border: "5px solid pink"
    }

    const styleNotDragged = {
        height: 150, 
        width: 90, 
        display: "inline-block" 
    }

    return (
        <div className="column">
            <img
                ref={drag}
                className="rounded object-cover"
                src={props.item.pathImagen}
                alt={props.item.idItem}
                style={isDragging ? styleDragged : styleNotDragged} />
        </div>
    )
}

export default TarjetaItem