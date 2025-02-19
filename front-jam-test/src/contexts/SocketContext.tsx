'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectToRoom: (roomId: string) => void;
  disconnectFromRoom: () => void;
  emitEvent: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const emitEvent = useCallback(
    (event: string, data?: any) => {
      if (!socket || !isConnected) {
        toast.error('Not connected to room');
        return;
      }
      socket.emit(event, data);
    },
    [socket, isConnected],
  );

  const disconnectFromRoom = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const connectToRoom = useCallback(
    (roomId: string) => {
      if (!user) {
        toast.error('You must be logged in to join a room');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      const newSocket = io('http://localhost:8080/jam', {
        auth: {
          token,
          userId: user.id,
          roomId,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection events
      newSocket.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to room!');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Failed to connect: ' + error.message);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        toast.error(`Disconnected: ${reason}`);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        toast.success(`Reconnected after ${attemptNumber} attempts`);
      });

      // Room events
      newSocket.on('room:joined', (data) => {
        toast.success(`Successfully joined room: ${data.roomName}`);
      });

      newSocket.on('room:left', () => {
        toast.success('Left the room');
      });

      newSocket.on('room:error', (error) => {
        toast.error(error.message);
      });

      // Participant events
      newSocket.on('participant:joined', (data) => {
        toast.success(`${data.username} joined the room`);
      });

      newSocket.on('participant:left', (data) => {
        toast.success(`${data.username} left the room`);
      });

      newSocket.on('participant:updated', (data) => {
        toast.success(`${data.username} updated their settings`);
      });

      // Music control events
      newSocket.on('track:play', (data) => {
        toast.success(
          `${data.username} started playing ${data.trackName || 'the track'}`,
        );
      });

      newSocket.on('track:pause', (data) => {
        toast.success(`${data.username} paused the track`);
      });

      newSocket.on('track:change', (data) => {
        toast.success(`Now playing: ${data.trackName}`);
      });

      newSocket.on('track:error', (error) => {
        toast.error(`Playback error: ${error.message}`);
      });

      // Chat events
      newSocket.on('chat:message', (data) => {
        toast.success(`${data.username}: ${data.message}`);
      });

      setSocket(newSocket);
    },
    [user, socket],
  );

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectToRoom,
        disconnectFromRoom,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
