import i18n from "../i18n"
import ReactCountryFlag from "react-country-flag"

const ChangeLanguage = () => {

    const cambiarLenguage = (lng) => {
        i18n.changeLanguage(lng)
    }

    const styleFooter = {
        textAlign: "center",
        position: "fixed",
        bottom: 0,
        width: "100%"
    }

    return (
        <div className="has-text-centered" style={styleFooter}>
            <div onClick={() => cambiarLenguage('en')} style={{display: "inline-block", cursor: "pointer"}}>

            <ReactCountryFlag
                countryCode="US"
                svg
                style={{
                    width: '3em',
                    height: '3em',
                }}
                title="US"
            />
            </div>
            <span>    </span>
            <div onClick={() => cambiarLenguage('es')} style={{display: "inline-block", cursor: "pointer"}} >
            <ReactCountryFlag
                countryCode="ES"
                svg
                style={{
                    width: '3em',
                    height: '3em',
                }}
                title="ES"
            />
            </div>
        </div>
    )
}

export default ChangeLanguage