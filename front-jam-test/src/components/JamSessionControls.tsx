import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';

interface JamSessionControlsProps {
  roomId: string;
  userId: string;
}

const AVAILABLE_INSTRUMENTS = [
  { id: 'guitar', name: 'Guitar' },
  { id: 'bass', name: 'Bass' },
  { id: 'drums', name: 'Drums' },
  { id: 'keyboard', name: 'Keyboard' },
  { id: 'vocals', name: 'Vocals' },
  { id: 'other', name: 'Other' },
];

export default function JamSessionControls({
  roomId,
  userId,
}: JamSessionControlsProps) {
  const { emitEvent } = useSocket();
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [isReady, setIsReady] = useState(false);

  const handleInstrumentChange = (instrument: string) => {
    setSelectedInstrument(instrument);
    emitEvent('participant:update', {
      roomId,
      userId,
      instrument,
    });
    toast.success(`Instrument changed to ${instrument}`);
  };

  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    emitEvent('participant:ready', {
      roomId,
      userId,
      ready: newReadyState,
    });
    toast.success(newReadyState ? 'Ready to jam!' : 'Not ready');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3 text-black">Select Your Instrument</h3>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_INSTRUMENTS.map((instrument) => (
            <button
              key={instrument.id}
              onClick={() => handleInstrumentChange(instrument.id)}
              className={`p-2 rounded-md transition-colors ${
                selectedInstrument === instrument.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
              }`}
            >
              {instrument.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={toggleReady}
          className={`w-full p-3 rounded-md transition-colors ${
            isReady
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          {isReady ? 'Ready to Jam!' : 'Click when ready'}
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-3 text-black">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => emitEvent('jam:reaction', { type: 'applause' })}
            className="w-full p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-black"
          >
            👏 Applaud
          </button>
          <button
            onClick={() => emitEvent('jam:reaction', { type: 'encore' })}
            className="w-full p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-black"
          >
            🎵 Request Encore
          </button>
        </div>
      </div>
    </div>
  );
}
