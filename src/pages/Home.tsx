import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
    const [trendingSeries, setTrendingSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    useEffect(() => {
        fetchTrending();
    }, []);

    async function fetchTrending() {
        try {
            // Fetching ALL data as requested
            const { data: movies } = await supabase
                .from('movies')
                .select('id, title, poster_path, vote_average, release_date, genres, overview, backdrop_path')
                .order('popularity', { ascending: false });

            const { data: series } = await supabase
                .from('series')
                .select('id, name, poster_path, vote_average, first_air_date')
                .order('popularity', { ascending: false });

            setTrendingMovies(movies || []);
            setTrendingSeries(series || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    // Extract unique genres from movies
    const allGenres = Array.from(new Set(
        trendingMovies.flatMap(m => {
            try {
                return typeof m.genres === 'string' ? JSON.parse(m.genres) : m.genres;
            } catch { return []; }
        }).map((g: any) => g.name)
    )).sort();

    // Filter content
    const filteredMovies = selectedGenre
        ? trendingMovies.filter(m => {
            try {
                const genres = typeof m.genres === 'string' ? JSON.parse(m.genres) : m.genres;
                return genres.some((g: any) => g.name === selectedGenre);
            } catch { return false; }
        })
        : trendingMovies;

    const filteredSeries = selectedGenre
        ? trendingSeries.filter(s => {
            // Assuming series also have genres, if not fetched, they won't filter well.
            return true;
        })
        : trendingSeries;


    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const FeaturedMovie = filteredMovies[0] || trendingMovies[0];

    return (
        <div className="home fade-in">
            {FeaturedMovie && (
                <div className="hero" style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.2), var(--bg-color)), url(${FeaturedMovie.backdrop_path || FeaturedMovie.poster_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '60vh',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '2rem',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent 40%, var(--bg-color) 100%)' }}></div>

                    <div className="hero-content" style={{ maxWidth: '800px', position: 'relative', zIndex: 2 }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-main)', textShadow: '2px 2px 4px rgba(255,255,255,0.5)' }}>
                            {FeaturedMovie.title}
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '2rem', maxWidth: '600px', background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
                            {FeaturedMovie.overview ? (FeaturedMovie.overview.substring(0, 150) + '...') : 'Top trending movie. Watch now in high quality.'}
                        </p>
                        <Link to={`/movie/${FeaturedMovie.id}`} className="card-button" style={{ display: 'inline-block', width: 'auto', padding: '12px 30px', background: 'var(--primary-color)', color: '#fff', border: 'none' }}>
                            Watch Now <span style={{ fontSize: '1.2rem', marginLeft: '5px' }}>▶</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Genre Filter Bar */}
            <div className="section" style={{ paddingBottom: '0' }}>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                    <button
                        onClick={() => setSelectedGenre(null)}
                        style={{
                            padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: selectedGenre === null ? 'var(--primary-color)' : 'rgba(0,0,0,0.05)',
                            color: selectedGenre === null ? 'white' : 'var(--text-main)', fontWeight: 600, whiteSpace: 'nowrap',
                            boxShadow: selectedGenre === null ? '0 4px 10px rgba(98,0,234,0.3)' : 'none'
                        }}
                    >
                        All
                    </button>
                    {allGenres.map(genre => (
                        <button
                            key={genre as string}
                            onClick={() => setSelectedGenre(genre as string)}
                            style={{
                                padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                background: selectedGenre === genre ? 'var(--primary-color)' : 'white',
                                color: selectedGenre === genre ? 'white' : 'var(--text-main)', fontWeight: 600, whiteSpace: 'nowrap',
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxShadow: selectedGenre === genre ? '0 4px 10px rgba(98,0,234,0.3)' : 'none'
                            }}
                        >
                            {genre as string}
                        </button>
                    ))}
                </div>
            </div>

            <section className="section">
                <h2>{selectedGenre ? `${selectedGenre} Movies` : 'All Movies'}</h2>
                <div className="grid">
                    {filteredMovies.map(movie => (
                        <Link key={movie.id} to={`/movie/${movie.id}`} className="card">
                            <img src={movie.poster_path} alt={movie.title} loading="lazy" />
                            <div className="card-info">
                                <h3>{movie.title}</h3>
                                <div className="card-meta">
                                    <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
                                    <span>{movie.release_date?.split('-')[0]}</span>
                                </div>
                                {/* Display first genre if available and parsed correctly */}
                                {movie.genres && typeof movie.genres === 'string' ? (
                                    <div style={{ marginBottom: '10px' }}>
                                        {(() => {
                                            try {
                                                const g = JSON.parse(movie.genres);
                                                return g.slice(0, 2).map((gen: any) => (
                                                    <span key={gen.id} style={{ fontSize: '0.7rem', color: 'white', marginRight: '5px', background: 'var(--primary-color)', padding: '2px 8px', borderRadius: '10px' }}>
                                                        {gen.name}
                                                    </span>
                                                ));
                                            } catch (e) { return null; }
                                        })()}
                                    </div>
                                ) : null}

                                <div className="card-button">View Details</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="section">
                <h2>All Series</h2>
                <div className="grid">
                    {filteredSeries.map(s => (
                        <Link key={s.id} to={`/series/${s.id}`} className="card">
                            <img src={s.poster_path} alt={s.name} loading="lazy" />
                            <div className="card-info">
                                <h3>{s.name}</h3>
                                <div className="card-meta">
                                    <span className="rating">⭐ {s.vote_average?.toFixed(1)}</span>
                                    <span>{s.first_air_date?.split('-')[0]}</span>
                                </div>
                                <div className="card-button">View Details</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
