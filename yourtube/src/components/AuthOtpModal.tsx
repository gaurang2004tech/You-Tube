"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { X, Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axiosInstance from "@/lib/axiosinstance";
import { useThemeLocation } from "@/lib/ThemeLocationContext";
import { useUser } from "@/lib/AuthContext";

interface AuthOtpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthOtpModal({ isOpen, onClose }: AuthOtpModalProps) {
    const { isSouthIndia, isLoading } = useThemeLocation();
    const { otpLogin } = useUser();
    const [step, setStep] = useState<"input" | "verify">("input");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);

    if (!isOpen) return null;

    const authType = "email";
    const placeholder = "Email address";
    const Icon = Mail;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier) return toast.error(`Please enter your ${authType}`);

        setSending(true);
        try {
            await axiosInstance.post("/user/send-otp", {
                identifier,
                type: authType,
            });
            toast.success(`OTP sent to your ${authType}`);
            setStep("verify");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setSending(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return toast.error("Please enter the OTP");

        setVerifying(true);
        try {
            const { data } = await axiosInstance.post("/user/verify-otp", {
                identifier,
                otp,
                type: authType,
                region: isSouthIndia ? "South India" : "Other",
            });

            otpLogin(data.result);
            toast.success("Successfully logged in!");
            onClose();
            // Reset state for next time
            setTimeout(() => {
                setStep("input");
                setIdentifier("");
                setOtp("");
            }, 500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-1 dark:text-white">
                        Welcome to YourTube
                    </h2>
                    <p className="text-sm text-center text-gray-500 mb-8">
                        {isLoading
                            ? "Checking region..."
                            : "Please verify your Email address to continue"}
                    </p>

                    {step === "input" ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                    <Icon size={18} />
                                </span>
                                <Input
                                    type="email"
                                    placeholder={placeholder}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="pl-10 h-12"
                                    disabled={isLoading || sending}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 flex items-center gap-2"
                                disabled={isLoading || sending}
                            >
                                {sending ? "Sending..." : "Send OTP"}
                                {!sending && <ArrowRight size={16} />}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                    Enter the 4-digit code sent to<br />
                                    <strong>{identifier}</strong>
                                </p>
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-12 text-center tracking-widest text-lg font-bold"
                                    maxLength={4}
                                    disabled={verifying}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={verifying || otp.length < 4}
                            >
                                {verifying ? "Verifying..." : "Verify & Login"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep("input")}
                                className="w-full text-xs text-center text-gray-500 hover:text-gray-700 mt-4"
                            >
                                Use a different email address
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
