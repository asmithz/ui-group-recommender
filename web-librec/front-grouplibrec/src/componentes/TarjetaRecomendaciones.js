import Lottie from "lottie-react"
import loadingRecommendation from "../animations/loading-recommendation.json"
import ListaItems from "./ListaItems"
import PanelHistorialRecomendaciones from "./PanelHistorialRecomendaciones"

const TarjetaRecomendaciones = (props) => {
    return (
        <div className="columns">
            <div className="column">
                <div className="box" style={{ height: 660 }}>
                    <div className="columns">
                        <div className="column">
                            {
                                props.tipoRecomendacion === "individual" &&
                                <div className="columns">
                                    <div className="column is-four-fifths">
                                        <p className="is-size-4">
                                            Your recommendations
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
                                            Recommendations for everyone
                                        </p>
                                    </div>
                                    <div className="column has-text-right">
                                        <PanelHistorialRecomendaciones socket={props.socket} enviarAlStack={props.enviarAlStack} idUsuario={props.idUsuario} idGrupo={props.idGrupo} tipo="grupal" />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="columns" style={{ overflowY: "scroll" , height: 500}} >
                        {
                            !props.cargando &&
                            <div className="column">
                                <ListaItems recomendaciones={props.recomendaciones} socket={props.socket} tipo={props.tipoRecomendacion} enviarAlStack={props.enviarAlStack} idGrupo={props.idGrupo} idUsuario={props.idUsuario} />
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