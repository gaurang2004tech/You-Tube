"use client";
import React, { useEffect, useRef } from "react";
import { useCommunication } from "@/lib/CommunicationContext";
import { Phone, PhoneOff, Monitor, Radio, Mic, MicOff, Video, VideoOff, Download } from "lucide-react";
import { Button } from "./ui/button";

const VideoCallOverlay = () => {
    const {
        callState, incomingCall, answerCall, endCall, toggleScreenShare,
        startRecording, stopRecording, isRecording, isScreenSharing,
        localStream, remoteStream, screenStream, remoteIsSharing,
        isAudioMuted, isVideoMuted, toggleAudio, toggleVideo
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-0 md:p-4">
            <div className="relative w-full h-full md:h-auto md:max-w-5xl md:aspect-video bg-zinc-900 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header / Info */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex items-center gap-2 md:gap-3">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white font-mono text-[10px] md:text-sm uppercase tracking-widest">
                        {callState === "ringing" ? "Incoming Call..." : callState === "calling" ? "Calling..." : "In Call"}
                    </span>
                    {isRecording && (
                        <div className="flex items-center gap-1 md:gap-2 bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold animate-bounce ml-2 md:ml-4">
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
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse">
                                <Phone size={32} className="md:w-10 md:h-10" />
                            </div>
                            <p className="text-sm md:text-base text-center px-4">{callState === "ringing" ? `From: ${incomingCall?.fromName}` : "Waiting for Answer..."}</p>
                        </div>
                    )}

                    {/* Local Video (Small Overlay) */}
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-28 md:w-56 aspect-[3/4] md:aspect-video bg-zinc-800 rounded-lg md:rounded-xl overflow-hidden border-2 border-zinc-700 shadow-xl overflow-hidden z-20">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                        />
                        <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-black/40 text-[8px] md:text-[10px] text-white px-1 md:px-1.5 py-0.5 rounded backdrop-blur-md">
                            You
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 md:p-8 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 flex flex-wrap items-center justify-center gap-3 md:gap-6">
                    {callState === "ringing" ? (
                        <>
                            <Button
                                onClick={answerCall}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full h-14 w-14 md:h-16 md:w-16 shadow-lg shadow-green-500/20"
                            >
                                <Phone size={24} className="md:w-7 md:h-7" />
                            </Button>
                            <Button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full h-14 w-14 md:h-16 md:w-16 shadow-lg shadow-red-500/20 ml-4"
                            >
                                <PhoneOff size={24} className="md:w-7 md:h-7" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={toggleAudio}
                                className={`md:hidden rounded-full h-10 w-10 md:h-12 md:w-12 transition-all ${isAudioMuted ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}
                            >
                                {isAudioMuted ? <MicOff size={18} className="md:w-5 md:h-5" /> : <Mic size={18} className="md:w-5 md:h-5" />}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={toggleVideo}
                                className={`md:hidden rounded-full h-10 w-10 md:h-12 md:w-12 transition-all ${isVideoMuted ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}
                            >
                                {isVideoMuted ? <VideoOff size={18} className="md:w-5 md:h-5" /> : <Video size={18} className="md:w-5 md:h-5" />}
                            </Button>

                            <div className="hidden md:block w-px h-8 bg-zinc-800 mx-2" />

                            {/* Screen Share */}
                            <Button
                                onClick={toggleScreenShare}
                                className={`rounded-full h-10 md:h-12 gap-2 px-4 md:px-6 transition-all ${isScreenSharing ? "bg-blue-500 text-white" : "border-zinc-700 text-zinc-400 bg-transparent border hover:bg-zinc-800"}`}
                            >
                                <Monitor size={18} className="md:w-5 md:h-5" />
                                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                                    {isScreenSharing ? "Sharing" : "Screen Share"}
                                </span>
                            </Button>

                            {/* Record */}
                            <Button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`rounded-full h-10 md:h-12 gap-2 px-4 md:px-6 transition-all ${isRecording ? "bg-red-500 text-white" : "border-zinc-700 text-zinc-400 bg-transparent border hover:bg-zinc-800"}`}
                            >
                                <Download size={18} className="md:w-5 md:h-5" />
                                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                                    {isRecording ? "Stop REC" : "Record"}
                                </span>
                            </Button>

                            <div className="hidden md:block w-px h-8 bg-zinc-800 mx-2" />

                            <Button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full h-12 w-12 md:h-14 md:w-14 shadow-lg shadow-red-500/20 ml-2"
                            >
                                <PhoneOff size={20} className="md:w-6 md:h-6" />
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
