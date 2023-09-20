//import HEAVY_METAL from "../images/heavy_metal.jpg"
//import ELECTRONIC from "../images/electronic.jpg"

import { faMusic, faHeadphonesSimple, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const TestPerfilUsuario = () => {
    const idUsuario = sessionStorage.getItem("id_usuario")
    const navigate = useNavigate()
    const [categories, setCategories] = useState({
        metal: false,
        electronica: false,
        rock: false,
        jazz: false,
        country: false,
        folk: false,
        funk: false,
        blues: false,
        rap: false,
        soundtrack: false,
        espiritual: false,
        alternativo: false,
        pop: false
    })

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCategories((prevCategories) => ({
            ...prevCategories,
            [name]: checked,
        }))
    }

    const generarPerfil = async () => {
        try {
            //let idUsuario = 1
            const resp = await api.post("/generar-perfil", ({ idUsuario: idUsuario, categories: categories}), {
                headers: {
                    "Content-type": "application/json"
                }
            })
            if(resp.data.ok == "ok"){
                console.log("ok")
                navigate("/salas", { replace: true })
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        console.log(categories)
    }, [categories])

    return (
        <div className="container mt-6" style={{ maxWidth: "500px" }}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-3 has-text-centered">How about your music taste?</p>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box">
                        <div className="block">
                            <p className="is-size-4"><FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> Select your prefered genres: </p>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Metal</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="metal"
                                                checked={categories.metal}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Electronic/dance</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="electronica"
                                                checked={categories.electronica}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Rock</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="rock"
                                                checked={categories.rock}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Jazz</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="jazz"
                                                checked={categories.jazz}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Funk</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="funk"
                                                checked={categories.funk}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Country</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="country"
                                                checked={categories.country}
                                                onChange={handleCheckboxChange}
                                            />

                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Blues</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="blues"
                                                checked={categories.blues}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Rap/hip-hop</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="rap"
                                                checked={categories.rap}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Soundtrack</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="soundtrack"
                                                checked={categories.soundtrack}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Espiritual</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="espiritual"
                                                checked={categories.espiritual}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Alternative</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="alternativo"
                                                checked={categories.alternativo}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Pop</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="pop"
                                                checked={categories.pop}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="block">
                                    <label className="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Folk</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="folk"
                                                checked={categories.folk}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {/*
                            <div className="column">
                                <div className="block">
                                    <label class="checkbox">
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Ambiental</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="ambiental"
                                                checked={categories.ambiental}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            */}
                        </div>
                        <div className="block has-text-centered">
                            <button className="button rounded" onClick={generarPerfil}>Continue </button>
                        </div>
                    </div>
                </div>
            </div>
            {/*
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={HEAVY_METAL} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Metal</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="box has-text-centered">
                        <div className="block">
                            <img src={ELECTRONIC} style={{ height: 200 }} />
                        </div>
                        <div className="block">
                            <p className="is-size-3">Electronic/dance</p>
                            <label class="checkbox">
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            */}

        </div>
    )
}
export default TestPerfilUsuario