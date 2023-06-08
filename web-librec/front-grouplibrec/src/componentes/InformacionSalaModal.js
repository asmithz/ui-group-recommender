const InformacionSalaModal = (props) => {
    const styleModal = {
        backgroundColor: "white",
        padding: "50px",
        borderRadius: "10px"
    }
    return (
        <>
            {props.estado &&
                <div className={props.estado ? "modal is-active" : "modal"} key={props.keySala}>
                    <div className={props.estado ? "modal-background" : ""} onClick={() => props.cambiarEstado(false)}></div>
                    <div className="modal-content" style={styleModal}>
                        <section>
                            <p className="is-size-4">Nombre Sala: <span className="is-size-5">{props.salaInfo.titulo}</span></p>
                        </section>
                        <section>
                            <p className="is-size-4">Lider: <span className="is-size-5">{props.salaInfo.lider}</span></p>
                        </section>
                        <section>
                            <p className="is-size-4">Descripción: </p>
                            <span className="is-size-5">{props.salaInfo.descripcion}</span>
                        </section>
                        <section>
                            <p className="is-size-4">Usuarios Activos: </p>
                            {
                                props.salaInfo.usuarios_activos.length > 0 ?
                                    props.salaInfo.usuarios_activos.map((usuarioActivo, usuarioActivoIndex) => {
                                        return (
                                            <li key={usuarioActivo + usuarioActivoIndex}>{usuarioActivo.usuario}</li>
                                        )
                                    })
                                :
                                <></>
                            }
                        </section>
                    </div>
                </div>
            }
        </>
    )
}

const UsuarioEnGrupo = (props) => {
    console.log(props.salaInfo)
    props.salaInfo.usuarios_activos.map((nombreIntegrante, integranteIndex) => {
        return (
            <li key={nombreIntegrante + integranteIndex}>{nombreIntegrante}</li>
        )
    })
}

export default InformacionSalaModal