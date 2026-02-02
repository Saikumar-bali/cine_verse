import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GenreBadge from '../components/GenreBadge';
import './Detail.css';

export default function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    useEffect(() => {
        fetchMovie();
        window.scrollTo(0, 0);
    }, [id]);

    async function fetchMovie() {
        try {
            const { data } = await supabase
                .from('movies')
                .select('*')
                .eq('id', id)
                .single();

            setMovie(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!movie) return <div className="loading">Movie not found</div>;

    // Helper to extract videos safely
    const getVideos = () => {
        let vids: any[] = [];
        try {
            if (movie.videos) {
                // If it's a string, parse it. If it's already an array, use it.
                vids = typeof movie.videos === 'string' ? JSON.parse(movie.videos) : movie.videos;
            }

            // If main videos is empty, check nested data
            if ((!vids || vids.length === 0) && movie.data && movie.data.videos) {
                vids = movie.data.videos;
            }
        } catch (e) {
            console.error("Error parsing videos:", e);
        }
        return Array.isArray(vids) ? vids : [];
    };

    const videoList = getVideos();

    // Helper to extract genres safely
    const getGenres = () => {
        let genres: any[] = [];
        try {
            if (movie.genres) {
                genres = typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres;
            }
        } catch (e) { console.error(e); }
        return Array.isArray(genres) ? genres : [];
    };

    const genreList = getGenres();

    return (
        <div className="detail">
            {/* Video Player Overlay */}
            {playingVideo && (
                <div className="video-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                }}>
                    <div style={{ width: '90%', maxWidth: '1000px', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                        <iframe
                            src={playingVideo}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                        ></iframe>
                    </div>
                    <button
                        onClick={() => setPlayingVideo(null)}
                        style={{
                            marginTop: '20px', padding: '10px 30px', background: '#ff4444', color: 'white',
                            border: 'none', borderRadius: '5px', fontSize: '1.2rem', cursor: 'pointer'
                        }}
                    >
                        Close Player
                    </button>
                </div>
            )}

            <div className="detail-backdrop" style={{ backgroundImage: `url(${movie.backdrop_path})` }}>
                <div className="detail-overlay"></div>
            </div>
            <div className="detail-content">
                <img src={movie.poster_path} alt={movie.title} className="detail-poster" />
                <div className="detail-info">
                    <h1>{movie.title}</h1>
                    <div className="meta">
                        <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
                        <span>{movie.release_date}</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {genreList.map((g: any, i: number) => (
                                <GenreBadge key={g.id || i} name={g.name} />
                            ))}
                        </div>
                    </div>
                    <p className="overview">{movie.overview}</p>

                    <div className="videos">
                        <h3>Watch Options</h3>
                        {videoList.length > 0 ? (
                            <div className="video-list">
                                {videoList.map((v: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setPlayingVideo(v.link)}
                                        className="video-btn"
                                        title={`Server: ${v.server || 'Default'}`}
                                    >
                                        <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>▶</span>
                                        Watch ({v.server || `Server ${i + 1}`})
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                                <p style={{ marginBottom: '10px' }}><strong>No video links found.</strong></p>
                                <small>This might be because the movie data is incomplete or restricted.</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
