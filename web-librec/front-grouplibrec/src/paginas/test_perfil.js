import { faMusic, faHeadphonesSimple, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const TestPerfilUsuario = () => {
    const { t, i18n } = useTranslation("paginas/test_perfil")

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

            const trainSala = await api.get("/obtener-sala-trainning", {
                params: { idUsuario }, 
                headers: {
                    "Content-type": "application/json"
                }
            })

            if(resp.data.ok === "ok" && trainSala){
                //navigate("/salas", { replace: true })
                navigate(`/trainning-room/${trainSala.data._id}`, { replace: true })
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="container mt-6" style={{ maxWidth: "500px" }}>
            <div className="columns">
                <div className="column">
                    <p className="is-size-3 has-text-centered">{t('main.title')}</p>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="box" style={{ border: "1px solid #000"}}>
                        <div className="block">
                            <p className="is-size-4"><FontAwesomeIcon icon={faHeadphonesSimple} style={{ color: "#e1092a", }} /> {t('main.subtitle')} </p>
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
                                                <p className="is-size-5"> <FontAwesomeIcon icon={faMusic} style={{ color: "#335BFF" }} /> Gospel</p>
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
                            <button className="button is-rounded is-primary" onClick={generarPerfil}>{t('main.button')} </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default TestPerfilUsuario