import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import '../pages/Home.css';

export default function Series() {
    const [series, setSeries] = useState<any[]>([]);
    const [search] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSeries();
    }, [search]);

    async function fetchSeries() {
        setLoading(true);
        try {
            let query = supabase
                .from('series')
                .select('id, name, poster_path, vote_average, first_air_date, data')
                .order('popularity', { ascending: false })
                .limit(50);

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            const { data } = await query;
            setSeries(data || []);
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
                    placeholder="Search series..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div> */}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="grid">
                    {series.map(s => {
                        const poster = s.poster_path || s.data?.poster_path || 'https://via.placeholder.com/500x750?text=No+Poster';
                        const rating = s.vote_average || s.data?.vote_average || 0;

                        return (
                            <Link key={s.id} to={`/series/${s.id}`} className="card">
                                <img src={poster} alt={s.name} />
                                <div className="card-info">
                                    <h3>{s.name}</h3>
                                    <span>⭐ {rating.toFixed(1)} Rating</span>
                                    <div className="card-button">View Collection</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
