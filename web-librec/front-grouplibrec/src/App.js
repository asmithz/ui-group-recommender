import { BrowserRouter, Routes, Route } from "react-router-dom"
import Interfaz from "./paginas/interfaz"
import Login from "./paginas/login"
import Sala from "./paginas/salas"
import Registrar from "./paginas/registrar"
import Ingresar from "./paginas/ingresar"
import Grupo from "./paginas/grupo"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DndProvider } from "react-dnd"

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <Routes>
            <Route exact path="/ingresar" element={<Ingresar />}></Route>
            <Route exact path="/login" element={<Login />}></Route>
            <Route exact path="/index" element={<Interfaz />}></Route>
            <Route exact path="/salas" element={<Sala />}></Route>
            <Route exact path="/registrar" element={<Registrar />}></Route>
              <Route exact path="/grupo/:id" element={<Grupo />}></Route>
          </Routes>
        </BrowserRouter>
    </DndProvider>
  );
}

export default App;
