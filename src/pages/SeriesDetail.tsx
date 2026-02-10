import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GenreBadge from '../components/GenreBadge';
import './Detail.css';

export default function SeriesDetail() {
    const { id } = useParams();
    const [series, setSeries] = useState<any>(null);
    const [selectedSeason, setSelectedSeason] = useState(0);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    useEffect(() => {
        fetchSeries();
        window.scrollTo(0, 0);
    }, [id]);

    async function fetchSeries() {
        try {
            const { data } = await supabase
                .from('series')
                .select('*')
                .eq('id', id)
                .single();

            setSeries(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    // Helper functions to resolve missing data from the 'data' blob
    const getPoster = () => {
        if (series?.poster_path && series.poster_path !== "") return series.poster_path;
        if (series?.data && series.data.poster_path) return series.data.poster_path;
        return 'https://via.placeholder.com/500x750?text=No+Poster';
    };

    const getBackdrop = () => {
        if (series?.backdrop_path && series.backdrop_path !== "") return series.backdrop_path;
        if (series?.data && series.data.backdrop_path) return series.data.backdrop_path;
        return 'https://via.placeholder.com/1280x720?text=No+Backdrop';
    };

    const getFirstAirDate = () => series?.first_air_date || series?.data?.first_air_date || 'N/A';
    const getRating = () => series?.vote_average || series?.data?.vote_average || 0;
    const getOverview = () => series?.overview || series?.data?.overview || 'No overview available.';

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!series) return <div className="loading">Series not found</div>;

    // Parse genres safely
    let genreList: any[] = [];
    try {
        let genres = series.genres;
        if (!genres || (Array.isArray(genres) && genres.length === 0)) {
            genres = series.data?.genres;
        }
        if (typeof genres === 'string') {
            genreList = JSON.parse(genres);
        } else if (Array.isArray(genres)) {
            genreList = genres;
        }
    } catch (e) { console.error(e); }

    const seasons = series.seasons || [];
    const currentSeason = seasons[selectedSeason];

    return (
        <div className="detail fade-in">
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

            <div className="detail-backdrop" style={{ backgroundImage: `url(${getBackdrop()})` }}>
                <div className="detail-overlay"></div>
            </div>
            <div className="detail-content">
                <img src={getPoster()} alt={series.name} className="detail-poster" />
                <div className="detail-info">
                    <h1>{series.name}</h1>
                    <div className="meta">
                        <span className="rating">⭐ {getRating().toFixed(1)}</span>
                        <span>{getFirstAirDate()}</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {genreList.filter(g => g && g.name).map((g: any, i: number) => (
                                <GenreBadge key={g.id || i} name={g.name} />
                            ))}
                        </div>
                    </div>
                    <p className="overview">{getOverview()}</p>

                    {seasons.length > 0 && (
                        <div className="seasons">
                            <h3>Seasons</h3>
                            <div className="season-tabs">
                                {seasons.map((s: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedSeason(i)}
                                        className={`season-tab ${selectedSeason === i ? 'active' : ''}`}
                                    >
                                        Season {s.season_number}
                                    </button>
                                ))}
                            </div>

                            {currentSeason?.episodes && (
                                <div className="episodes">
                                    <h4>Episodes</h4>
                                    {currentSeason.episodes.map((ep: any, i: number) => (
                                        <div key={i} className="episode">
                                            <span>Ep {ep.episode_number}: {ep.name}</span>
                                            {ep.videos?.length > 0 ? (
                                                <div className="episode-videos">
                                                    {ep.videos.map((v: any, j: number) => (
                                                        <button
                                                            key={j}
                                                            onClick={() => setPlayingVideo(v.link)}
                                                            className="video-btn small"
                                                        >
                                                            ▶ Watch ({v.server || 'Link'})
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>No links</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
