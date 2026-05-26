"use client";
import React, { useState } from "react";
import { Crown, Clock, Zap, CheckCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosinstance";

declare global {
    interface Window { Razorpay: any; }
}

const PLANS = [
    {
        key: "bronze",
        label: "Bronze",
        price: 10,
        amount: 1000,
        watchMin: 7,
        color: "from-amber-600 to-yellow-500",
        border: "border-amber-300 dark:border-amber-900/50",
        bg: "bg-amber-50 dark:bg-amber-950/20",
        emoji: "🥉",
    },
    {
        key: "silver",
        label: "Silver",
        price: 50,
        amount: 5000,
        watchMin: 10,
        color: "from-slate-400 to-gray-300",
        border: "border-slate-300 dark:border-slate-700",
        bg: "bg-slate-50 dark:bg-slate-900/40",
        emoji: "🥈",
        popular: true,
    },
    {
        key: "gold",
        label: "Gold",
        price: 100,
        amount: 10000,
        watchMin: null,
        color: "from-yellow-400 to-orange-400",
        border: "border-yellow-300 dark:border-yellow-900/50",
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        emoji: "🥇",
    },
];

interface UpgradeOverlayProps {
    expiredPlan: string;        // current plan that expired
    userId: string;
    userEmail: string;
    onUpgrade: (plan: string) => void;
    onClose?: () => void;
}

const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

export default function UpgradeOverlay({
    expiredPlan,
    userId,
    userEmail,
    onUpgrade,
    onClose,
}: UpgradeOverlayProps) {
    const [paying, setPaying] = useState<string | null>(null);
    const planLabel = expiredPlan === "free" ? "5-minute free preview" :
        expiredPlan === "bronze" ? "7-minute Bronze preview" :
            expiredPlan === "silver" ? "10-minute Silver preview" : "preview";

    const handlePlanSelect = async (plan: typeof PLANS[0]) => {
        setPaying(plan.key);
        const loaded = await loadRazorpay();
        if (!loaded) {
            toast.error("Payment gateway failed to load.");
            setPaying(null);
            return;
        }
        try {
            const { data: order } = await axiosInstance.post("/payment/create-order", {
                plan: plan.key,
            });
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "YourTube",
                description: `${plan.label} Plan`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const verify = await axiosInstance.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId,
                            plan: plan.key,
                        });
                        if (verify.data.success) {
                            toast.success(
                                `🎉 ${plan.emoji} ${plan.label} Plan activated! Invoice sent to your email.`
                            );
                            onUpgrade(plan.key);
                        }
                    } catch {
                        toast.error("Verification failed. Contact support.");
                    } finally {
                        setPaying(null);
                    }
                },
                prefill: { email: userEmail },
                theme: { color: "#FF0000" },
                modal: { ondismiss: () => setPaying(null) },
            };
            new window.Razorpay(options).open();
        } catch (err) {
            toast.error("Could not initiate payment.");
            setPaying(null);
        }
    };

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-lg">
            <div className="w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-5 text-white text-center relative">
                    {onClose && (
                        <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white">
                            <X size={18} />
                        </button>
                    )}
                    <Clock size={28} className="mx-auto mb-2" />
                    <h2 className="text-xl font-bold">Your {planLabel} has ended</h2>
                    <p className="text-white/80 text-sm mt-1">
                        Upgrade to keep watching — invoice sent to your email
                    </p>
                </div>

                {/* Plan cards */}
                <div className="p-5 grid grid-cols-3 gap-3">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.key}
                            className={`relative rounded-xl border-2 ${plan.border} ${plan.bg} p-3 flex flex-col items-center text-center`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    POPULAR
                                </span>
                            )}
                            <span className="text-2xl mb-1">{plan.emoji}</span>
                            <h3 className="font-bold text-sm dark:text-zinc-100">{plan.label}</h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 mb-2">
                                {plan.watchMin ? `${plan.watchMin} min watch` : "Unlimited ♾️"}
                            </p>
                            <p className="text-lg font-extrabold text-gray-800 dark:text-zinc-100">₹{plan.price}</p>
                            <Button
                                size="sm"
                                className={`mt-3 w-full text-white bg-gradient-to-r ${plan.color} hover:opacity-90 text-xs font-semibold`}
                                onClick={() => handlePlanSelect(plan)}
                                disabled={!!paying}
                            >
                                {paying === plan.key ? "Opening…" : "Upgrade"}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="px-5 pb-4">
                    <ul className="space-y-1.5">
                        {["Secure payment via Razorpay", "Invoice emailed instantly", "Upgrade any time"].map((t) => (
                            <li key={t} className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                                <CheckCircle size={13} className="text-green-500 dark:text-green-400 shrink-0" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
