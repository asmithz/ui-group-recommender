import Lottie from "lottie-react"
import loadingRecommendation from "../animations/loading-recommendation.json"
import ListaItems from "./ListaItems"
import PanelHistorialRecomendaciones from "./PanelHistorialRecomendaciones"

const TarjetaRecomendaciones = (props) => {
    return (
        <div className="columns">
            <div className="column">
                <div className="box" style={{ height: 320 }}>
                    <div className="columns">
                        <div className="column">
                            {
                                props.tipoRecomendacion === "individual" &&
                                <div className="columns">
                                    <div className="column is-four-fifths">
                                        <p className="is-size-4">
                                            Sus recomendaciones
                                        </p>
                                    </div>
                                    <div className="column has-text-right">
                                        <PanelHistorialRecomendaciones idUsuario={props.idUsuario} idGrupo={props.idGrupo} tipo="individual"/>
                                    </div>
                                </div>
                            }
                            {
                                props.tipoRecomendacion === "grupal" &&
                                <div className="columns">
                                    <div className="column is-four-fifths">
                                        <p className="is-size-4">
                                            Recomendaciones de la sala
                                        </p>
                                    </div>
                                    <div className="column has-text-right">
                                        <PanelHistorialRecomendaciones idUsuario={props.idUsuario} idGrupo={props.idGrupo} tipo="grupal"/>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="columns">
                        {
                            !props.cargando &&
                            <div className="column" >
                                <ListaItems recomendaciones={props.recomendaciones} tipo={props.tipoRecomendacion} />
                            </div>
                        }
                        {
                            props.cargando &&
                            <div className="column">
                                <div style={{ width: "250px", height: "250px" }}>
                                    <Lottie
                                        animationData={loadingRecommendation}
                                        loop={true}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TarjetaRecomendaciones