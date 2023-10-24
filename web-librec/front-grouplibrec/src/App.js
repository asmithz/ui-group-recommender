import { BrowserRouter, Routes, Route } from "react-router-dom"
import Interfaz from "./paginas/interfaz"
import Login from "./paginas/login"
import Sala from "./paginas/salas"
import Registrar from "./paginas/registrar"
import Ingresar from "./paginas/ingresar"
import Grupo from "./paginas/grupo"
import SalaEspera from "./paginas/sala_espera"
import TestPersonalidad from "./paginas/test_personalidad"
import TestPerfilUsuario from "./paginas/test_perfil"
import EncuestaFinal from "./paginas/encuesta_final"
import { Suspense } from "react"
import ChangeLanguage from "./componentes/ChangeLanguage" 

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route exact path="/ingresar" element={<Ingresar />}></Route>
          <Route exact path="/login" element={<Login />}></Route>
          <Route exact path="/index" element={<Interfaz />}></Route>
          <Route exact path="/salas" element={<Sala />}></Route>
          <Route exact path="/registrar" element={<Registrar />}></Route>
          <Route exact path="/grupo/:id" element={<Grupo />}></Route>
          <Route exact path="/sala-espera/:id" element={<SalaEspera />}></Route>
          <Route exact path="/encuesta-final/:id" element={<EncuestaFinal />}></Route>
          <Route exact path="/test-personalidad" element={<TestPersonalidad />}></Route>
          <Route exact path="/test-perfil" element={<TestPerfilUsuario />}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default function WrappedApp() {
  return(
    <Suspense fallback="Loading...">
      <App/>
      <ChangeLanguage />
    </Suspense>
  )
}

//export default App;
