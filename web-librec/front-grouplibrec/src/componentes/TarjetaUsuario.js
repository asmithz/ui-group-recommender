import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown } from "@fortawesome/free-solid-svg-icons"

const TarjetaUsuario = (props) => {
    const usuarioImagenStyle = {
        width: "50px", 
        height: "auto" 
    }

    const textoUsuario = {
        display: "flex",
        alignItems: "center",
    }

    return(
        <div className="columns">
            <div className="column is-one-quarter" style={textoUsuario}>
                <img src={props.usuario.imagen_usuario} style={usuarioImagenStyle} alt="user" />
            </div>
            <div className="column" style={textoUsuario}>
                {
                    props.usuario.usuario === props.liderGrupo.usuario_lider &&
                    <FontAwesomeIcon icon={faCrown} size="lg" style={{color: "#efe815"}} />
                }
                <p className="is-size-5 has-text-weight-bold">{props.usuario.usuario}</p>
            </div>
        </div>
    )
}

export default TarjetaUsuario