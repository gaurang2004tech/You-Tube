import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./AuthContext";
import { toast } from "sonner";

interface CommunicationContextType {
    socket: Socket | null;
    callUser: (userId: string) => void;
    answerCall: () => void;
    endCall: () => void;
    toggleScreenShare: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    callState: "idle" | "calling" | "ringing" | "connected";
    incomingCall: { fromId: string; fromName: string; offer: any } | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    screenStream: MediaStream | null;
    isScreenSharing: boolean;
    isRecording: boolean;
    remoteIsSharing: boolean;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const useCommunication = () => {
    const context = useContext(CommunicationContext);
    if (!context) throw new Error("useCommunication must be used within a CommunicationProvider");
    return context;
};

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected">("idle");
    const [incomingCall, setIncomingCall] = useState<{ fromId: string; fromName: string; offer: any } | null>(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [remoteIsSharing, setRemoteIsSharing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const targetUserId = useRef<string | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        if (!user) return;

        const newSocket = io(backendUrl);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("join-auth", user._id);
        });

        newSocket.on("incoming-call", ({ offer, fromName, fromId }) => {
            setIncomingCall({ offer, fromName, fromId });
            setCallState("ringing");
        });

        newSocket.on("call-answered", async ({ answer }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                setCallState("connected");
            }
        });

        newSocket.on("ice-candidate", async ({ candidate }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        });

        newSocket.on("call-ended", () => {
            cleanupCall();
        });

        newSocket.on("screen-share-toggled", ({ isSharing }) => {
            setRemoteIsSharing(isSharing);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const createPeerConnection = (targetId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit("ice-candidate", { to: targetId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peerConnection.current = pc;
        return pc;
    };

    const callUser = async (userId: string) => {
        try {
            targetUserId.current = userId;
            setCallState("calling");

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            const pc = createPeerConnection(userId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket?.emit("call-user", {
                to: userId,
                offer,
                fromName: user?.name || user?.email,
                fromId: user?._id
            });
        } catch (err: any) {
            console.error("Call failed:", err);
            setCallState("idle");
            if (err.name === "NotReadableError") {
                toast.error("Camera/Mic in use by another application. Please close other apps and try again.");
            } else if (err.name === "NotAllowedError") {
                toast.error("Permission denied. Please allow camera and mic access.");
            } else {
                toast.error("Failed to start media. Please check your devices.");
            }
        }
    };

    const answerCall = async () => {
        if (!incomingCall) return;
        try {
            targetUserId.current = incomingCall.fromId;

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            const pc = createPeerConnection(incomingCall.fromId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket?.emit("answer-call", { to: incomingCall.fromId, answer });
            setCallState("connected");
            setIncomingCall(null);
        } catch (err: any) {
            console.error("Answer failed:", err);
            endCall();
            if (err.name === "NotReadableError") {
                toast.error("Camera/Mic in use. Please close other apps.");
            } else {
                toast.error("Failed to access camera/mic.");
            }
        }
    };

    const endCall = () => {
        socket?.emit("end-call", { to: targetUserId.current });
        cleanupCall();
    };

    const cleanupCall = () => {
        peerConnection.current?.close();
        peerConnection.current = null;
        localStream?.getTracks().forEach(t => t.stop());
        screenStream?.getTracks().forEach(t => t.stop());
        setLocalStream(null);
        setRemoteStream(null);
        setScreenStream(null);
        setCallState("idle");
        setIsScreenSharing(false);
        setRemoteIsSharing(false);
        setIsAudioMuted(false);
        setIsVideoMuted(false);
        setIncomingCall(null);
        targetUserId.current = null;
        if (isRecording) stopRecording();
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(stream);
                setIsScreenSharing(true);

                // Replace video track in peer connection
                if (peerConnection.current) {
                    const videoTrack = stream.getVideoTracks()[0];
                    const sender = peerConnection.current.getSenders().find(s => s.track?.kind === "video");
                    if (sender) sender.replaceTrack(videoTrack);

                    videoTrack.onended = () => {
                        stopScreenShare();
                    };
                }
                socket?.emit("toggle-screen-share", { to: targetUserId.current, isSharing: true });
            } catch (err) {
                console.error(err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = async () => {
        screenStream?.getTracks().forEach(t => t.stop());
        setScreenStream(null);
        setIsScreenSharing(false);

        // Restore camera
        if (peerConnection.current && localStream) {
            const cameraTrack = localStream.getVideoTracks()[0];
            const sender = peerConnection.current.getSenders().find(s => s.track?.kind === "video");
            if (sender) sender.replaceTrack(cameraTrack);
        }
        socket?.emit("toggle-screen-share", { to: targetUserId.current, isSharing: false });
    };

    const startRecording = () => {
        if (!remoteStream && !localStream) return;

        recordedChunks.current = [];
        // Combine streams or just record remote for simplicity (user usually wants to record the meeting)
        const streamToRecord = remoteStream || localStream;
        if (!streamToRecord) return;

        const options = { mimeType: "video/webm; codecs=vp9" };
        const recorder = new MediaRecorder(streamToRecord, options);

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.current.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks.current, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `meeting-record-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
            toast.success("Recording saved locally!");
        };

        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);
        toast.info("Recording started");
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        setIsRecording(false);
    };

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoMuted(!isVideoMuted);
        }
    };

    return (
        <CommunicationContext.Provider value={{
            socket, callUser, answerCall, endCall, toggleScreenShare, startRecording, stopRecording,
            callState, incomingCall, localStream, remoteStream, screenStream, isScreenSharing, isRecording, remoteIsSharing,
            isAudioMuted, isVideoMuted, toggleAudio, toggleVideo
        }}>
            {children}
        </CommunicationContext.Provider>
    );
};
