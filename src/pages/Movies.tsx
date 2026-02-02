import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import '../pages/Home.css';

export default function Movies() {
    const [movies, setMovies] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, [search]);

    async function fetchMovies() {
        setLoading(true);
        try {
            let query = supabase
                .from('movies')
                .select('id, title, poster_path, vote_average, release_date')
                .order('popularity', { ascending: false })
                .limit(50);

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }

            const { data } = await query;
            setMovies(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="home">
            {/* <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div> */}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="grid">
                    {movies.map(movie => (
                        <Link key={movie.id} to={`/movie/${movie.id}`} className="card">
                            <img src={movie.poster_path} alt={movie.title} />
                            <div className="card-info">
                                <h3>{movie.title}</h3>
                                <span>₹{movie.vote_average?.toFixed(1)} Rating</span>
                                <div className="card-button">View Collection</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
