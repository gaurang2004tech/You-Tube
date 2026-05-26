"use client";
import React, { useState } from "react";
import { Crown, Download, CheckCircle, X, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosinstance";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onUpgradeSuccess: () => void;
}

const PremiumModal = ({
    isOpen,
    onClose,
    userId,
    onUpgradeSuccess,
}: PremiumModalProps) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Failed to load payment gateway. Please try again.");
                setLoading(false);
                return;
            }

            // Create Razorpay order
            const { data: order } = await axiosInstance.post(
                "/payment/create-order",
                { plan: "gold" }
            );

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "YourTube Premium",
                description: "Unlimited video downloads",
                image: "/logo.png",
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await axiosInstance.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId,
                            plan: "gold",
                        });
                        if (verifyRes.data.success) {
                            toast.success(
                                "🎉 You're now a Premium member! Enjoy unlimited downloads."
                            );
                            onUpgradeSuccess();
                            onClose();
                        }
                    } catch {
                        toast.error("Payment verification failed. Contact support.");
                    }
                },
                prefill: {},
                theme: { color: "#FF0000" },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-6 text-white text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex justify-center mb-3">
                        <div className="bg-white/20 rounded-full p-3">
                            <Crown size={36} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">YourTube Premium</h2>
                    <p className="text-white/90 text-sm mt-1">
                        Download unlimited videos, anytime.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6">
                    <ul className="space-y-3 mb-6">
                        {[
                            "Unlimited video downloads per day",
                            "Download in original quality",
                            "Access downloads offline anytime",
                            "Support creators directly",
                        ].map((benefit) => (
                            <li key={benefit} className="flex items-center gap-3 text-sm">
                                <CheckCircle size={18} className="text-green-500 shrink-0" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Free tier limit notice */}
                    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-5 text-sm text-orange-700 dark:text-orange-400 flex items-start gap-2">
                        <Zap size={16} className="shrink-0 mt-0.5" />
                        <span>
                            Free plan: <strong>1 download/day</strong>. You've reached today's
                            limit. Upgrade to continue downloading.
                        </span>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold py-3 text-base rounded-xl"
                        onClick={handleUpgrade}
                        disabled={loading}
                    >
                        {loading ? (
                            "Opening Payment…"
                        ) : (
                            <>
                                <Crown size={18} className="mr-2" />
                                Upgrade for ₹99 / one-time
                            </>
                        )}
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        Secure payment via Razorpay · Test mode
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
