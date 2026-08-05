import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface MusicPlayerProps {
  roomId: string;
  isHost: boolean;
}

const DEMO_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Demo Track 1',
    artist: 'Artist 1',
    url: 'https://d3cqeg6fl6kah.cloudfront.net/tracks/default/track.mp3'
  },
  {
    id: '2',
    title: 'Demo Track 2',
    artist: 'Artist 2',
    url: 'https://d3cqeg6fl6kah.cloudfront.net/tracks/default/track.mp3'
  }
];

export default function MusicPlayer({ roomId, isHost }: MusicPlayerProps) {
  const { emitEvent, socket } = useSocket();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!socket) return;

    console.log('Setting up playback control listener');

    const handlePlaybackControl = (data: { action: string; time?: number; trackId?: string }) => {
      console.log('Received playback control:', data);
      if (!audioRef.current) return;

      switch (data.action) {
        case 'play':
          audioRef.current.currentTime = data.time || 0;
          audioRef.current.play();
          setIsPlaying(true);
          break;
        case 'pause':
          audioRef.current.pause();
          setIsPlaying(false);
          break;
        case 'seek':
          if (data.time !== undefined) {
            audioRef.current.currentTime = data.time;
          }
          break;
        case 'track-change':
          console.log('Track change received:', data.trackId);
          if (data.trackId) {
            const newTrack = DEMO_TRACKS.find(t => t.id === data.trackId);
            console.log('New track found:', newTrack);
            if (newTrack) {
              setCurrentTrack(newTrack);
              setIsPlaying(false);
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }
          }
          break;
      }
    };

    socket.on('playback:control', handlePlaybackControl);

    return () => {
      console.log('Cleaning up playback control listener');
      socket.off('playback:control', handlePlaybackControl);
    };
  }, [socket]);

  const handlePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isHost) {
      emitEvent('playback:control', {
        action: 'play',
        time: audioRef.current.currentTime,
        trackId: currentTrack.id
      });
    } else {
      toast.error('Only the host can control playback');
    }
  };

  const handlePause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isHost) {
      emitEvent('playback:control', {
        action: 'pause',
        trackId: currentTrack.id
      });
    } else {
      toast.error('Only the host can control playback');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !isHost) return;

    const time = parseFloat(e.target.value);
    emitEvent('playback:control', {
      action: 'seek',
      time,
      trackId: currentTrack?.id
    });
  };

  const handleTrackChange = (track: Track) => {
    console.log('handleTrackChange called with track:', track);
    if (!isHost) {
      toast.error('Only the host can change tracks');
      return;
    }

    // Mettre à jour localement
    setCurrentTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    
    // Émettre l'événement
    console.log('Emitting track change event');
    emitEvent('playback:control', {
      action: 'track-change',
      trackId: track.id
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Ajouter un effet pour logger les changements d'état
  useEffect(() => {
    console.log('Current track updated:', currentTrack);
  }, [currentTrack]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => {
          console.log('Audio metadata loaded, duration:', audioRef.current?.duration);
          setDuration(audioRef.current?.duration || 0);
        }}
        onError={(e) => console.error('Audio error:', e)}
      />

      {/* Track Selection */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2 text-black">Select Track</h3>
        <div className="space-y-2">
          {DEMO_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track)}
              className={`w-full p-2 rounded-md text-left ${
                currentTrack?.id === track.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
              disabled={!isHost}
            >
              <div className="font-medium">{track.title}</div>
              <div className="text-sm opacity-75">{track.artist}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="space-y-4">
        {currentTrack ? (
          <>
            <div className="text-center text-black">
              <div className="font-medium">{currentTrack.title}</div>
              <div className="text-sm text-gray-500">{currentTrack.artist}</div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="flex-grow"
                disabled={!isHost}
              />
              <span className="text-sm text-gray-500">
                {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => (isPlaying ? handlePause() : handlePlay())}
                className={`px-4 py-2 rounded-md ${
                  isHost ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600'
                }`}
                disabled={!isHost}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-grow"
              />
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            {isHost ? 'Select a track to begin' : 'Waiting for host to select a track'}
          </div>
        )}
      </div>
    </div>
  );
} 