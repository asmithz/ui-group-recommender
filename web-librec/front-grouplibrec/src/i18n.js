import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from "i18next-browser-languagedetector"
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        ns: [
            "componentes/chat",
            "componentes/destinatario_usuario_modal",
            "componentes/informacion_sala_modal",
            "componentes/item_modal",
            "componentes/lista_items",
            "componentes/nueva_sala_modal",
            "componentes/panel_favoritos",
            "componentes/panel_historial_recomendados",
            "componentes/tarjeta_item",
            "componentes/tarjeta_recomendaciones",
            "componentes/tarjeta_usuario",
            "paginas/calificar",
            "paginas/encuesta_final",
            "paginas/grupo",
            "paginas/ingresar",
            "paginas/interfaz",
            "paginas/login",
            "paginas/registrar",
            "paginas/sala_espera",
            "paginas/salas",
            "paginas/test_perfil",
            "paginas/test_personalidad",
        ],
    });

export default i18n;