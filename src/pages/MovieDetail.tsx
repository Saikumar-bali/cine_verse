import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { buildMoviePlaybackUrl } from '../lib/playback';
import GenreBadge from '../components/GenreBadge';
import './Detail.css';

export default function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [playerError, setPlayerError] = useState<string | null>(null);

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

    const getPoster = () => {
        if (movie?.poster_path && movie.poster_path !== '') return movie.poster_path;
        if (movie?.data && movie.data.poster_path) return movie.data.poster_path;
        return 'https://via.placeholder.com/500x750?text=No+Poster';
    };

    const getBackdrop = () => {
        if (movie?.backdrop_path && movie.backdrop_path !== '') return movie.backdrop_path;
        if (movie?.data && movie.data.backdrop_path) return movie.data.backdrop_path;
        return 'https://via.placeholder.com/1280x720?text=No+Backdrop';
    };

    const getReleaseDate = () => movie?.release_date || movie?.data?.release_date || 'N/A';
    const getRating = () => movie?.vote_average || movie?.data?.vote_average || 0;
    const getOverview = () => movie?.overview || movie?.data?.overview || 'No overview available.';

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!movie) return <div className="loading">Movie not found</div>;

    const getVideos = () => {
        let vids: any[] = [];
        try {
            if (movie.videos) {
                vids = typeof movie.videos === 'string' ? JSON.parse(movie.videos) : movie.videos;
            }

            if ((!vids || vids.length === 0) && movie.data && movie.data.videos) {
                vids = movie.data.videos;
            }
        } catch (error) {
            console.error('Error parsing videos:', error);
        }
        return Array.isArray(vids) ? vids : [];
    };

    const videoList = getVideos();

    const getGenres = () => {
        let genres = movie.genres;
        if (!genres || (Array.isArray(genres) && genres.length === 0)) {
            genres = movie.data?.genres;
        }
        if (typeof genres === 'string') {
            try {
                genres = JSON.parse(genres);
            } catch {
                genres = [];
            }
        }
        return Array.isArray(genres) ? genres : [];
    };

    const genreList = getGenres();

    return (
        <div className="detail">
            {playingVideo && (
                <div
                    className="video-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ width: '90%', maxWidth: '1000px', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                        <video
                            src={playingVideo}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            controls
                            autoPlay
                            playsInline
                            onError={() => setPlayerError('Playback broker could not fetch this source. If the provider blocks Vercel IPs, move the broker to your own media origin or your own storage/CDN.')}
                            onCanPlay={() => setPlayerError(null)}
                        />
                    </div>
                    {playerError && (
                        <p style={{ marginTop: '16px', color: '#fca5a5', maxWidth: '900px', textAlign: 'center' }}>
                            {playerError}
                        </p>
                    )}
                    <button
                        onClick={() => {
                            setPlayingVideo(null);
                            setPlayerError(null);
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '10px 30px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                        }}
                    >
                        Close Player
                    </button>
                </div>
            )}

            <div className="detail-backdrop" style={{ backgroundImage: `url(${getBackdrop()})` }}>
                <div className="detail-overlay"></div>
            </div>
            <div className="detail-content">
                <img src={getPoster()} alt={movie.title} className="detail-poster" />
                <div className="detail-info">
                    <h1>{movie.title}</h1>
                    <div className="meta">
                        <span className="rating">Rating {getRating().toFixed(1)}</span>
                        <span>{getReleaseDate()}</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {genreList.filter((g) => g && g.name).map((g: any, index: number) => (
                                <GenreBadge key={g.id || index} name={g.name} />
                            ))}
                        </div>
                    </div>
                    <p className="overview">{getOverview()}</p>

                    <div className="videos">
                        <h3>Watch Options</h3>
                        {videoList.length > 0 ? (
                            <div className="video-list">
                                {videoList.map((v: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setPlayerError(null);
                                            setPlayingVideo(buildMoviePlaybackUrl(id || movie.id, index));
                                        }}
                                        className="video-btn"
                                        title={`Server: ${v.server || 'Default'}`}
                                    >
                                        Play ({v.server || `Server ${index + 1}`})
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
