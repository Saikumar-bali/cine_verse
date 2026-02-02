import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import './Search.css';

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query]);

    async function fetchResults() {
        try {
            const { data: movies } = await supabase
                .from('movies')
                .select('id, title, poster_path, vote_average, release_date')
                .ilike('title', `%${query}%`);

            const { data: series } = await supabase
                .from('series')
                .select('id, name, poster_path, vote_average, first_air_date')
                .ilike('name', `%${query}%`);

            setResults([...(movies || []), ...(series || [])]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="search-page fade-in" style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Search Results for <span style={{ color: 'var(--primary-color)' }}>"{query}"</span></h1>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : (
                <div className="section">
                    {results.length === 0 ? (
                        <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#888' }}>No results found.</div>
                    ) : (
                        <div className="grid">
                            {results.map(item => (
                                <Link key={item.id} to={`/${item.name ? 'series' : 'movie'}/${item.id}`} className="card">
                                    <img src={item.poster_path || 'placeholder.jpg'} alt={item.title || item.name} loading="lazy" />
                                    <div className="card-info">
                                        <h3>{item.title || item.name}</h3>
                                        <div className="card-meta">
                                            <span className="rating">⭐ {item.vote_average?.toFixed(1)}</span>
                                            <span>{(item.release_date || item.first_air_date)?.split('-')[0]}</span>
                                        </div>
                                        <div className="card-button">View Details</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
