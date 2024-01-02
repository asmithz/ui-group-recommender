import { useTranslation } from "react-i18next"

const InformacionSalaModal = (props) => {
    const { t, i18n } = useTranslation("componentes/informacion_sala_modal")

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
                            <p className="is-size-4">{t('main.roomName')}: <span className="is-size-5">{props.salaInfo.titulo}</span></p>
                        </section>
                        <section>
                            <p className="is-size-4">{t('main.creator')}: <span className="is-size-5">{props.salaInfo.lider}</span></p>
                        </section>
                        <section>
                            <p className="is-size-4">{t('main.description')}: </p>
                            <span className="is-size-5">{props.salaInfo.descripcion}</span>
                        </section>
                        <section>
                            <p className="is-size-4">{t('main.activeUsers')}: </p>
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
    props.salaInfo.usuarios_activos.map((nombreIntegrante, integranteIndex) => {
        return (
            <li key={nombreIntegrante + integranteIndex}>{nombreIntegrante}</li>
        )
    })
}

export default InformacionSalaModal