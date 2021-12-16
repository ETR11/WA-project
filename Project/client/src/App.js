import './App.css';
import MenuHeader from './Components/MenuHeader';
import Register from './Components/Register';
import Login from './Components/Login';
import Snippets from './Components/Snippets';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from './Components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <MenuHeader />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/snippets/:id" element={<Snippets />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
