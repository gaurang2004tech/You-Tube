"use client";
import React, { useState } from "react";
import { Crown, CheckCircle, X } from "lucide-react";
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

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userEmail?: string;
    onUpgradeSuccess: (plan: string) => void;
    title?: string;
    subtitle?: string;
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

export default function PlansModal({
    isOpen,
    onClose,
    userId,
    userEmail,
    onUpgradeSuccess,
    title = "Upgrade Your Plan",
    subtitle = "Get access to unlimited watch time and downloads",
}: PlansModalProps) {
    const [paying, setPaying] = useState<string | null>(null);

    if (!isOpen) return null;

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
                            onUpgradeSuccess(plan.key);
                            onClose();
                        }
                    } catch {
                        toast.error("Verification failed. Contact support.");
                    } finally {
                        setPaying(null);
                    }
                },
                prefill: { email: userEmail || "" },
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden relative">
                {/* Header (Fixed) */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 md:py-6 text-white text-center flex-shrink-0 relative">
                    <button onClick={onClose} className="absolute top-3 right-3 md:top-4 md:right-4 text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                    <Crown size={28} className="mx-auto mb-2 md:mb-3 text-yellow-300 md:w-8 md:h-8" />
                    <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                    <p className="text-white/90 text-xs md:text-sm mt-1">{subtitle}</p>
                </div>

                {/* Body (Scrollable on small screens) */}
                <div className="p-4 md:p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.key}
                                className={`relative rounded-xl border-2 ${plan.border} ${plan.bg} p-4 flex flex-col items-center text-center`}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                                        Popular
                                    </span>
                                )}
                                <span className="text-3xl mb-2">{plan.emoji}</span>
                                <h3 className="font-bold text-base dark:text-zinc-100">{plan.label}</h3>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-3">
                                    {plan.watchMin ? `${plan.watchMin} min watch` : "Unlimited ♾️"}
                                </p>
                                <p className="text-xl font-extrabold text-gray-800 dark:text-zinc-100">₹{plan.price}</p>
                                <Button
                                    size="sm"
                                    className={`mt-4 w-full text-white bg-gradient-to-r ${plan.color} hover:opacity-90 text-sm font-semibold`}
                                    onClick={() => handlePlanSelect(plan)}
                                    disabled={!!paying}
                                >
                                    {paying === plan.key ? "Wait…" : "Upgrade"}
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pb-2">
                        <ul className="space-y-2">
                            {[
                                "Unlimited downloads on Gold Plan (Free/Bronze/Silver get 1/day)",
                                "Invoice emailed instantly to your registered address",
                                "Secure test mode payment via Razorpay",
                            ].map((t) => (
                                <li key={t} className="flex items-start gap-2 text-[11px] md:text-xs text-gray-500 dark:text-zinc-400">
                                    <CheckCircle size={14} className="text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
