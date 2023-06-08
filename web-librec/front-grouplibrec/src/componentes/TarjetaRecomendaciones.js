import Lottie from "lottie-react"
import loadingRecommendation from "../animations/loading-recommendation.json"
import ListaItems from "./ListaItems"

const TarjetaRecomendaciones = (props) => {
    return (
        <div className="columns">
            <div className="column">
                <div className="box" style={{ height: 320 }}>
                    <div className="columns">
                        <div className="column">
                            {
                                props.tipoRecomendacion === "individual" &&
                                <p className="is-size-4">
                                    Recomendación Individual
                                </p>
                            }
                            {
                                props.tipoRecomendacion === "grupal" &&
                                <p className="is-size-4">
                                    Recomendación Grupal
                                </p>
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