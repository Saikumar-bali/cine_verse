import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { buildSeriesPlaybackUrl } from '../lib/playback';
import GenreBadge from '../components/GenreBadge';
import './Detail.css';

export default function SeriesDetail() {
    const { id } = useParams();
    const [series, setSeries] = useState<any>(null);
    const [selectedSeason, setSelectedSeason] = useState(0);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [playerError, setPlayerError] = useState<string | null>(null);

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

    const getPoster = () => {
        if (series?.poster_path && series.poster_path !== '') return series.poster_path;
        if (series?.data && series.data.poster_path) return series.data.poster_path;
        return 'https://via.placeholder.com/500x750?text=No+Poster';
    };

    const getBackdrop = () => {
        if (series?.backdrop_path && series.backdrop_path !== '') return series.backdrop_path;
        if (series?.data && series.data.backdrop_path) return series.data.backdrop_path;
        return 'https://via.placeholder.com/1280x720?text=No+Backdrop';
    };

    const getFirstAirDate = () => series?.first_air_date || series?.data?.first_air_date || 'N/A';
    const getRating = () => series?.vote_average || series?.data?.vote_average || 0;
    const getOverview = () => series?.overview || series?.data?.overview || 'No overview available.';

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!series) return <div className="loading">Series not found</div>;

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
    } catch (error) {
        console.error(error);
    }

    const seasons = series.seasons || [];
    const currentSeason = seasons[selectedSeason];

    return (
        <div className="detail fade-in">
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
                            onError={() => setPlayerError('Playback broker could not fetch this episode source. If provider access still fails on Vercel, move the broker to your own media origin or host the media yourself.')}
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
                <img src={getPoster()} alt={series.name} className="detail-poster" />
                <div className="detail-info">
                    <h1>{series.name}</h1>
                    <div className="meta">
                        <span className="rating">Rating {getRating().toFixed(1)}</span>
                        <span>{getFirstAirDate()}</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {genreList.filter((g) => g && g.name).map((g: any, index: number) => (
                                <GenreBadge key={g.id || index} name={g.name} />
                            ))}
                        </div>
                    </div>
                    <p className="overview">{getOverview()}</p>

                    {seasons.length > 0 && (
                        <div className="seasons">
                            <h3>Seasons</h3>
                            <div className="season-tabs">
                                {seasons.map((season: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedSeason(index)}
                                        className={`season-tab ${selectedSeason === index ? 'active' : ''}`}
                                    >
                                        Season {season.season_number}
                                    </button>
                                ))}
                            </div>

                            {currentSeason?.episodes && (
                                <div className="episodes">
                                    <h4>Episodes</h4>
                                    {currentSeason.episodes.map((episode: any, episodeIndex: number) => (
                                        <div key={episodeIndex} className="episode">
                                            <span>Ep {episode.episode_number}: {episode.name}</span>
                                            {episode.videos?.length > 0 ? (
                                                <div className="episode-videos">
                                                    {episode.videos.map((video: any, slotIndex: number) => (
                                                        <button
                                                            key={slotIndex}
                                                            onClick={() => {
                                                                setPlayerError(null);
                                                                setPlayingVideo(buildSeriesPlaybackUrl(id || series.id, selectedSeason, episodeIndex, slotIndex));
                                                            }}
                                                            className="video-btn small"
                                                        >
                                                            Play ({video.server || 'Link'})
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
