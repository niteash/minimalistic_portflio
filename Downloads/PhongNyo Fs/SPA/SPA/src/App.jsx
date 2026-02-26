import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./component/Footer";
import Header from "./component/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Error from "./pages/404";

function App() {
  return (
    <Router>
      <div className="flex flex-col  min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/shop" element={<Shop />}></Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="*" element={<Error />}></Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
