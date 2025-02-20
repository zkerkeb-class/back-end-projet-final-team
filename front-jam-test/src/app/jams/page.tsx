'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import toast from 'react-hot-toast';

interface JamRoom {
  id: string;
  name: string;
  description: string;
  maxParticipants: number;
  creator: {
    username: string;
  };
  participants: Array<{
    userId: string;
    role: string;
    instrument: string;
  }>;
}

export default function JamsPage() {
  const [rooms, setRooms] = useState<JamRoom[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(5);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRooms();
  }, [user, router]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/jam');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jam', {
        name: newRoomName,
        description: newRoomDescription,
        maxParticipants: newRoomMaxParticipants,
      });
      setShowCreateModal(false);
      fetchRooms();
      toast.success('Room created successfully!');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/jams/${roomId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Jam Rooms</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-black">
              {room.name}
            </h2>
            <p className="text-black mb-4">{room.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-black">
                Host: {room.creator.username}
              </span>
              <span className="text-sm text-black">
                {room.participants.length}/{room.maxParticipants} participants
              </span>
            </div>
            <button
              onClick={() => joinRoom(room.id)}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Join Room
            </button>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Create New Room
            </h2>
            <form onSubmit={createRoom}>
              <div className="mb-4">
                <label className="block text-black mb-2">Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2">Description</label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={newRoomMaxParticipants}
                  onChange={(e) =>
                    setNewRoomMaxParticipants(Number(e.target.value))
                  }
                  className="w-full border rounded-md px-3 py-2 text-black"
                  min="2"
                  max="10"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-black hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
