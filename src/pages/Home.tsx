import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
    const [trendingSeries, setTrendingSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [heroIndex, setHeroIndex] = useState(0);
    const genreScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchTrending();
    }, []);

    // Helper functions to resolve missing data from the 'data' blob
    const getPoster = (item: any) => {
        if (item.poster_path && item.poster_path !== "") return item.poster_path;
        if (item.data && item.data.poster_path) return item.data.poster_path;
        return 'https://via.placeholder.com/500x750?text=No+Poster';
    };

    const getMeta = (item: any) => {
        const date = item.release_date || item.first_air_date || item.data?.release_date || item.data?.first_air_date;
        const year = date ? date.split('-')[0] : 'N/A';
        const rating = item.vote_average || item.data?.vote_average || 0;
        return { year, rating };
    };

    const getGenres = (item: any) => {
        let genres = item.genres;
        if (!genres || (Array.isArray(genres) && genres.length === 0)) {
            genres = item.data?.genres;
        }
        if (typeof genres === 'string') {
            try { return JSON.parse(genres); } catch { return []; }
        }
        return Array.isArray(genres) ? genres : [];
    };

    async function fetchTrending() {
        try {
            // Fetching ALL data as requested
            const { data: movies } = await supabase
                .from('movies')
                .select('id, title, poster_path, vote_average, release_date, genres, overview, backdrop_path')
                .order('popularity', { ascending: false });

            const { data: series } = await supabase
                .from('series')
                .select('id, name, poster_path, vote_average, first_air_date, overview, backdrop_path, data')
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
                const genres = typeof m.genres === 'string' ? JSON.parse(m.genres) : m.genres;
                return Array.isArray(genres) ? genres : [];
            } catch { return []; }
        }).filter(g => g && g.name).map((g: any) => g.name)
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
        ? trendingSeries.filter(() => {
            // Assuming series also have genres, if not fetched, they won't filter well.
            return true;
        })
        : trendingSeries;


    const heroItems = useMemo(() => {
        const movieItems = filteredMovies.slice(0, 3).map(m => ({ ...m, _type: 'movie' as const, _title: m.title }));
        const seriesItems = filteredSeries.slice(0, 2).map(s => ({ ...s, _type: 'series' as const, _title: s.name }));
        return [...movieItems, ...seriesItems].slice(0, 5);
    }, [filteredMovies, filteredSeries]);

    useEffect(() => {
        if (heroItems.length <= 1) return;
        const id = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroItems.length);
        }, 5000);
        return () => clearInterval(id);
    }, [heroItems.length]);

    useEffect(() => {
        if (heroIndex >= heroItems.length) {
            setHeroIndex(0);
        }
    }, [heroItems.length, heroIndex]);

    const activeHero = heroItems[heroIndex];
    const goPrev = () => {
        if (heroItems.length === 0) return;
        setHeroIndex(prev => (prev - 1 + heroItems.length) % heroItems.length);
    };
    const goNext = () => {
        if (heroItems.length === 0) return;
        setHeroIndex(prev => (prev + 1) % heroItems.length);
    };
    const scrollGenres = (dir: 'left' | 'right') => {
        const el = genreScrollRef.current;
        if (!el) return;
        const amount = Math.max(200, Math.floor(el.clientWidth * 0.6));
        el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="home fade-in">
            {activeHero && (
                <section className="hero">
                    <div
                        className="hero-media"
                        style={{ backgroundImage: `url(${activeHero.backdrop_path || activeHero.data?.backdrop_path || activeHero.poster_path || activeHero.data?.poster_path})` }}
                    ></div>
                    <div className="hero-gradient"></div>

                    <div className="hero-inner">
                        <button type="button" className="hero-control left" onClick={goPrev} aria-label="Previous">
                            ‹
                        </button>
                        <button type="button" className="hero-control right" onClick={goNext} aria-label="Next">
                            ›
                        </button>
                        <div className="hero-content">
                            <h1 className="hero-title">{activeHero._title}</h1>
                            <div className="hero-meta">
                                <span className="hero-rating">* {Number(activeHero.vote_average || activeHero.data?.vote_average || 0).toFixed(1)}</span>
                                <span className="hero-dot">.</span>
                                <span className="hero-year">{((activeHero.release_date || activeHero.first_air_date || activeHero.data?.release_date || activeHero.data?.first_air_date || '') as string).split('-')[0] || 'N/A'}</span>
                            </div>
                            <p className="hero-desc">
                                {activeHero.overview || activeHero.data?.overview
                                    ? ((activeHero.overview || activeHero.data?.overview).substring(0, 170) + '...')
                                    : 'Top trending pick. Watch now in high quality.'}
                            </p>
                            <div className="hero-actions">
                                <Link to={`/${activeHero._type}/${activeHero.id}`} className="hero-cta">
                                    Watch Now <span className="hero-cta-icon">Play</span>
                                </Link>
                                <Link to={`/${activeHero._type}/${activeHero.id}`} className="hero-ghost">
                                    Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Genre Filter Bar */}
            <div className="section" style={{ paddingBottom: '0' }}>
                <div className="genre-bar">
                    <button type="button" className="genre-scroll left" onClick={() => scrollGenres('left')} aria-label="Scroll genres left">
                        ‹
                    </button>
                    <div ref={genreScrollRef} className="genre-scroll-area">
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
                                padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                                background: selectedGenre === genre ? 'var(--primary-color)' : 'white',
                                color: selectedGenre === genre ? 'white' : 'var(--text-main)', fontWeight: 600, whiteSpace: 'nowrap',
                                border: selectedGenre === genre ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                boxShadow: selectedGenre === genre ? '0 4px 10px rgba(98,0,234,0.3)' : 'none'
                            }}
                        >
                            {genre as string}
                        </button>
                    ))}
                    </div>
                    <button type="button" className="genre-scroll right" onClick={() => scrollGenres('right')} aria-label="Scroll genres right">
                        ›
                    </button>
                </div>
            </div>

            <section className="section">
                <h2>{selectedGenre ? `${selectedGenre} Movies` : 'All Movies'}</h2>
                <div className="grid">
                    {filteredMovies.map(movie => {
                        const { year, rating } = getMeta(movie);
                        const genres = getGenres(movie);

                        return (
                            <Link key={movie.id} to={`/movie/${movie.id}`} className="card">
                                <img src={getPoster(movie)} alt={movie.title} loading="lazy" />
                                <div className="card-info">
                                    <h3>{movie.title}</h3>
                                    <div className="card-meta">
                                        <span className="rating">⭐ {rating.toFixed(1)}</span>
                                        <span>{year}</span>
                                    </div>

                                    {genres.length > 0 && (
                                        <div style={{ marginBottom: '10px' }}>
                                            {genres.slice(0, 2).map((gen: any, idx: number) => (
                                                <span key={gen.id || idx} style={{ fontSize: '0.7rem', color: 'white', marginRight: '5px', background: 'var(--primary-color)', padding: '2px 8px', borderRadius: '10px' }}>
                                                    {gen.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="card-button">View Details</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="section">
                <h2>All Series</h2>
                <div className="grid">
                    {filteredSeries.map(s => {
                        const { year, rating } = getMeta(s);
                        return (
                            <Link key={s.id} to={`/series/${s.id}`} className="card">
                                <img src={getPoster(s)} alt={s.name} loading="lazy" />
                                <div className="card-info">
                                    <h3>{s.name}</h3>
                                    <div className="card-meta">
                                        <span className="rating">⭐ {rating.toFixed(1)}</span>
                                        <span>{year}</span>
                                    </div>
                                    <div className="card-button">View Details</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
