import ListaItems from "./ListaItems"
import PanelHistorialRecomendaciones from "./PanelHistorialRecomendaciones"
import { useTranslation } from "react-i18next"
import '../css/LoadingDots.css'
import ProgressBar from "./ProgressBar"

const TarjetaRecomendaciones = (props) => {
    const { t, i18n } = useTranslation("componentes/tarjeta_recomendaciones")

    return (
        <div className="columns">
            <div className="column">
                <div className="box" style={{ height: 660, border: "1px solid #000" }}>
                    <div className="columns">
                        <div className="column">
                            {
                                props.tipoRecomendacion === "individual" &&
                                <div className="columns">
                                    <div className="column is-four-fifths">
                                        <p className="is-size-4">
                                            {t('main.individual.title')}
                                        </p>
                                    </div>
                                    <div className="column has-text-right">
                                        <PanelHistorialRecomendaciones socket={props.socket} enviarAlStack={props.enviarAlStack} idUsuario={props.idUsuario} idGrupo={props.idGrupo} tipo="individual" />
                                    </div>
                                </div>
                            }
                            {
                                props.tipoRecomendacion === "grupal" &&
                                <div className="columns">
                                    <div className="column is-four-fifths">
                                        <p className="is-size-4">
                                            {t('main.group.title')}
                                        </p>
                                    </div>
                                    <div className="column has-text-right">
                                        <PanelHistorialRecomendaciones socket={props.socket} enviarAlStack={props.enviarAlStack} idUsuario={props.idUsuario} idGrupo={props.idGrupo} tipo="grupal" />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="columns" style={{ overflowY: "scroll", height: 500 }} >
                        {
                            
                            !props.cargando &&
                            <div className="column">
                                <ListaItems recomendaciones={props.recomendaciones} socket={props.socket} tipo={props.tipoRecomendacion} enviarAlStack={props.enviarAlStack} idGrupo={props.idGrupo} idUsuario={props.idUsuario} />
                            </div>
                            
                        }
                        {
                            props.cargando &&
                            <div className="column">
                                <ProgressBar loaded={props.cargando} t={t} />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}



export default TarjetaRecomendaciones