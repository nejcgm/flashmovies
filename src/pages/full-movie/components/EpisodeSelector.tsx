import React, { useEffect, useState } from 'react'
import { fetchSpecificSeason } from '../../../utils/fetching';
import { Episode } from '../../../utils/Interfaces';
import CustomButton from '../../../components/CustomButton';

interface EpisodeSelectorProps {
    seasonsCount: number;
    type: string;
    movieId: string;
    title: string;
    onEpisodeChange?: (episode: Episode) => void;
}

export const EpisodeSelector = ({
    seasonsCount,
    type,
    movieId,
    title,
    onEpisodeChange,
}: EpisodeSelectorProps) => {
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    useEffect(() => {
        const loadSeasonEpisodes = async () => {
            try {
            const data = await fetchSpecificSeason(type, movieId, selectedSeason);
            if (data) {
                    setSeasonEpisodes(data.episodes);
                }
            } catch (error) {
                console.log("No season selected", error);
            } 
        };
        loadSeasonEpisodes();
    }, [selectedSeason]);

    useEffect(() => {
        if (seasonEpisodes?.length > 0) {
            setSelectedEpisode(seasonEpisodes[0]);
        }
    }, [seasonEpisodes]);

    const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const season = parseInt(event.target.value);
        setSelectedSeason(season);
    };

    const handleEpisodeChange = (episode: Episode) => {
        setSelectedEpisode(episode);
        onEpisodeChange?.(episode);
    };

    return (
        <>
        <div className="w-full sm:w-auto">
            <p className="font-semibold text-lg sm:text-[24px] text-yellow-500 mb-4">{title}</p>
            <div className="relative inline-block w-full sm:w-auto px-4 sm:px-0">
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full sm:w-auto appearance-none bg-gray-800 hover:bg-gray-700 transition-colors text-white px-6 py-2 pr-12 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-500 cursor-pointer text-[12px] font-semibold md:text-[16px]"
                    aria-label="Select season"
                >
                    {Array.from({ length: seasonsCount }, (_, i) => i + 1).map((season) => (
                        <option 
                            key={season} 
                            value={season}
                            className="bg-gray-800 hover:bg-gray-700 py-2"
                        >
                            Season {season}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-7 sm:px-4 pointer-events-none">
                    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
        <div className="mt-4 md:mt-6 flex gap-2 flex-wrap justify-center sm:justify-start">
            {seasonEpisodes?.map((episode) => (
                <div key={episode.id}>
                    <CustomButton 
                        onClick={() => {
                            handleEpisodeChange(episode);
                        }}
                        className={`sm:px-2 sm:py-1.5 px-2 py-[6px] md:text-sm text-[11px]
                            
                        ${selectedEpisode?.episode_number === episode.episode_number ? 'bg-yellow-500' : 'bg-gray-500'}`}
                        >
                        <p><span className="font-semibold">Eps {episode.episode_number}:</span> {episode.name}</p>
                    </CustomButton>
                </div>
            ))}
        </div>
        </>
    );
};