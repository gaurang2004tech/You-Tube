import React, { useEffect, useRef } from "react";
import { useCommunication } from "@/lib/CommunicationContext";
import { Phone, PhoneOff, Monitor, Radio, Mic, MicOff, Video, VideoOff, Download } from "lucide-react";
import { Button } from "./ui/button";

const VideoCallOverlay = () => {
    const {
        callState, incomingCall, answerCall, endCall, toggleScreenShare,
        startRecording, stopRecording, isRecording, isScreenSharing,
        localStream, remoteStream, screenStream, remoteIsSharing
    } = useCommunication();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (callState === "idle") return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header / Info */}
                <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white font-mono text-sm uppercase tracking-widest">
                        {callState === "ringing" ? "Incoming Call..." : callState === "calling" ? "Calling..." : "In Call"}
                    </span>
                    {isRecording && (
                        <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce ml-4">
                            <Radio size={12} /> REC
                        </div>
                    )}
                </div>

                {/* Main Video Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    {/* Remote Video (Main) */}
                    {callState === "connected" ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-zinc-500">
                            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse">
                                <Phone size={40} />
                            </div>
                            <p>{callState === "ringing" ? `From: ${incomingCall?.fromName}` : "Waiting for Answer..."}</p>
                        </div>
                    )}

                    {/* Local Video (Small Overlay) */}
                    <div className="absolute bottom-6 right-6 w-56 aspect-video bg-zinc-800 rounded-xl overflow-hidden border-2 border-zinc-700 shadow-xl overflow-hidden z-20">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                        />
                        <div className="absolute top-2 left-2 bg-black/40 text-[10px] text-white px-1.5 py-0.5 rounded backdrop-blur-md">
                            You
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-8 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-center gap-6">
                    {callState === "ringing" ? (
                        <>
                            <Button
                                onClick={answerCall}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full h-16 w-16 shadow-lg shadow-green-500/20"
                            >
                                <Phone size={28} />
                            </Button>
                            <Button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full h-16 w-16 shadow-lg shadow-red-500/20"
                            >
                                <PhoneOff size={28} />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                className="rounded-full h-12 w-12 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                            >
                                <Mic size={20} />
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full h-12 w-12 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                            >
                                <Video size={20} />
                            </Button>

                            <div className="w-px h-8 bg-zinc-800 mx-2" />

                            {/* Screen Share */}
                            <Button
                                onClick={toggleScreenShare}
                                className={`rounded-full h-12 gap-2 px-6 transition-all ${isScreenSharing ? "bg-blue-500 text-white" : "border-zinc-700 text-zinc-400 bg-transparent border hover:bg-zinc-800"}`}
                            >
                                <Monitor size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {isScreenSharing ? "Sharing" : "Screen Share"}
                                </span>
                            </Button>

                            {/* Record */}
                            <Button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`rounded-full h-12 gap-2 px-6 transition-all ${isRecording ? "bg-red-500 text-white" : "border-zinc-700 text-zinc-400 bg-transparent border hover:bg-zinc-800"}`}
                            >
                                <Download size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {isRecording ? "Stop REC" : "Record"}
                                </span>
                            </Button>

                            <div className="w-px h-8 bg-zinc-800 mx-2" />

                            <Button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full h-14 w-14 shadow-lg shadow-red-500/20 ml-2"
                            >
                                <PhoneOff size={24} />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default VideoCallOverlay;
