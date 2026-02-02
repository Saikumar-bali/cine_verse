import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Series from './pages/Series'
import MovieDetail from './pages/MovieDetail'
import SeriesDetail from './pages/SeriesDetail'
import Search from './pages/Search'
import Navbar from './components/Navbar'
import './App.css'

interface PageProps {
    title: string
    element: React.ReactNode
}

function Page({ title, element }: PageProps) {
    useEffect(() => {
        document.title = `${title} | CineVerse`
    }, [title])

    return <>{element}</>
}

function App() {
    console.log('App component rendering...')

    return (
        <div className="app">
            <Navbar />
            <Routes>
                <Route path="/" element={<Page title="Home" element={<Home />} />} />
                <Route path="/movies" element={<Page title="Movies" element={<Movies />} />} />
                <Route path="/series" element={<Page title="Series" element={<Series />} />} />
                <Route path="/movie/:id" element={<Page title="Movie Detail" element={<MovieDetail />} />} />
                <Route path="/series/:id" element={<Page title="Series Detail" element={<SeriesDetail />} />} />
                <Route path="/search" element={<Page title="Search" element={<Search />} />} />
            </Routes>
        </div>
    )
}

export default App
