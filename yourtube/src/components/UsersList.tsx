import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Phone, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/lib/AuthContext";
import { useCommunication } from "@/lib/CommunicationContext";

interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    channelname?: string;
}

const UsersList = ({ onClose }: { onClose: () => void }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { user: currentUser } = useUser();
    const { callUser } = useCommunication();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get("/user/all");
                setUsers(res.data.filter((u: User) => u._id !== currentUser?._id));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser?._id]);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed top-20 right-6 w-96 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[80] overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="text-xl font-bold tracking-tight">Call Friends</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X size={20} />
                </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-50 dark:border-zinc-900">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[400px]">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading folks...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">No users found</div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-zinc-900">
                        {filteredUsers.map((user) => (
                            <div key={user._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12 border-2 border-white dark:border-zinc-800 shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                            {user.name?.[0] || user.email?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{user.name || "Anonymous"}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        callUser(user._id);
                                        onClose();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 w-10 p-0 shadow-lg shadow-blue-500/20 transform group-hover:scale-110 transition-transform"
                                >
                                    <Phone size={18} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Real-time VoIP Powered</p>
            </div>
        </div>
    );
};

export default UsersList;
