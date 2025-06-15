import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProductPage from './pages/ProductPage'
import ProductList from './pages/ProductList'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Register from './pages/Register'
import Profile from './pages/Profile'
import WishList from './pages/WishList'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'
import { SearchProvider } from './contexts/searchContext'
import { AuthProvider } from './contexts/authContext'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<Homepage />} path='/' />
                    <Route element={<Login />} path='/login' />
                    <Route element={<Register />} path='/register' />
                    <Route element={<Cart />} path='/cart' />
                    <Route element={<Profile />} path='/profile' />
                    <Route element={<WishList />} path='/wishlist' />
                    {/* Wrap only ProductList and ProductPage with SearchProvider */}
                    <Route element={
                        <SearchProvider>
                            <ProductList />
                        </SearchProvider>
                    } path='/search/query/:query' />

                    <Route element={
                        <SearchProvider>
                            <ProductList />
                        </SearchProvider>
                    } path='/search/category/:category' />

                    <Route element={
                        <SearchProvider>
                            <ProductList />
                        </SearchProvider>
                    } path='/search/type/:productType' />

                    <Route element={
                        <SearchProvider>
                            <ProductPage />
                        </SearchProvider>
                    } path='/product/:p/:v' />

                    <Route element={<Checkout />} path='/checkout' />
                    <Route element={<NotFound />} path='*' />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
