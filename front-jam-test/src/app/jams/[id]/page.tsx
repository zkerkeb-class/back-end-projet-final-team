'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import toast from 'react-hot-toast';
import JamSessionControls from '@/components/JamSessionControls';

interface Participant {
  userId: string;
  role: string;
  instrument: string;
  ready?: boolean;
  User: {
    username: string;
  };
}

interface JamRoomDetails {
  id: string;
  name: string;
  description: string;
  maxParticipants: number;
  creator: {
    id: string;
    username: string;
  };
  participants: Participant[];
}

export default function JamRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { connectToRoom, disconnectFromRoom, socket, isConnected, emitEvent } =
    useSocket();
  const [room, setRoom] = useState<JamRoomDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reactions, setReactions] = useState<
    { type: string; username: string }[]
  >([]);

  const roomId = React.use(params).id;

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/jam/${roomId}`);
        console.log('room: ', response.data);
        setRoom(response.data);
        setParticipants(response.data.participants);
      } catch (error) {
        console.log('error: ', error);
        toast.error('Failed to fetch room details');
        router.push('/jams');
      }
    };

    fetchRoomDetails();
  }, [roomId, router]);

  // Effet pour la connexion socket
  useEffect(() => {
    if (!room || !user) return;

    console.log('Connecting to room:', room.id);
    connectToRoom(room.id);

    return () => {
      console.log('Disconnecting from room');
      disconnectFromRoom();
    };
  }, [room?.id, user?.id]); // Dépendances plus précises

  // Effet pour les événements socket
  useEffect(() => {
    if (!socket) return;

    console.log('Setting up socket event listeners');

    const handleParticipantsUpdate = (data: {
      participants: Participant[];
    }) => {
      console.log('Participants update received:', data);
      setParticipants(data.participants);
    };

    const handleReaction = (data: { type: string; username: string }) => {
      console.log('Reaction received:', data);
      setReactions((prev) => [...prev, data]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r !== data));
      }, 3000);
    };

    socket.on('participants:update', handleParticipantsUpdate);
    socket.on('room:state', handleParticipantsUpdate);
    socket.on('jam:reaction', handleReaction);

    return () => {
      console.log('Cleaning up socket event listeners');
      socket.off('participants:update', handleParticipantsUpdate);
      socket.off('room:state', handleParticipantsUpdate);
      socket.off('jam:reaction', handleReaction);
    };
  }, [socket]);

  if (!room || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const isHost = room.creator.id === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">{room.name}</h1>
          <p className="text-black">{room.description}</p>
          {isHost && (
            <div className="mt-4">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Host
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Participants Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Participants ({participants.length}/{room.maxParticipants})
            </h2>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                >
                  <div>
                    <span className="font-medium text-black">
                      {participant.User.username}
                    </span>
                    <span className="text-sm text-black ml-2">
                      ({participant.role})
                    </span>
                    {participant.ready && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Ready
                      </span>
                    )}
                  </div>
                  {participant.instrument && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {participant.instrument}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-black">Session Controls</h2>
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-600">
                    Connected to session
                  </span>
                </div>
                <JamSessionControls roomId={room.id} userId={user.id} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-sm text-red-600">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        <div className="fixed bottom-4 right-4 flex flex-col-reverse items-end space-y-reverse space-y-2">
          {reactions.map((reaction, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg px-4 py-2 animate-fade-in-up text-black"
            >
              {reaction.type === 'applause' ? '👏' : '🎵'} {reaction.username}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
