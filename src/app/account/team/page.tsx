'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout';
import { useSession } from 'next-auth/react';
import { TrashIcon, UserPlusIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/outline'; // Using UserIcon for User placeholder

// Interface for Member
interface TeamMember {
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    emailVerified?: string | null; // Used to determine status
}

const TeamPage = () => {
    const { data: session } = useSession();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null); // Typed status state

    // Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Fetch Members
    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/team/members');
            const data = await res.json();
            if (data.members) {
                setMembers(data.members);
            }
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    useEffect(() => {
        if (session) fetchMembers();
    }, [session]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setInviteStatus(null);

        try {
            const res = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setInviteStatus({ type: 'success', message: `Invitation sent to ${email}!` });
                setEmail('');
                fetchMembers(); // Refresh list to show pending
                // Don't close immediately so they see the success message
                setTimeout(() => {
                    setIsInviteModalOpen(false);
                    setInviteStatus(null);
                }, 2000);
            } else {
                setInviteStatus({ type: 'error', message: data.error || 'Failed to send invite.' });
            }
        } catch (err) {
            setInviteStatus({ type: 'error', message: 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: number) => {
        if (!confirm('Are you sure you want to remove this user? They will lose all access to your dashboard.')) return;

        try {
            // Using existing API which supports DELETE
            const res = await fetch(`/api/team/members?userId=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setMembers(members.filter(m => m.id !== userId));
            } else {
                alert('Failed to remove user.');
            }
        } catch (err) {
            alert('Error removing user.');
        }
    };

    if (!session) return <Layout><div>Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team Members</h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Invite colleagues to view your dashboard data. They will have Read-Only access.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="mt-4 md:mt-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-sm"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Invite Member
                    </button>
                </div>

                {/* Members List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <UserPlusIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No team members yet</h3>
                            <p className="text-gray-500 max-w-sm mb-6">Get started by inviting your first team member to collaborate on your dashboard.</p>
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Invite your first member
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {members.map((member) => {
                                        // Determine badges
                                        const isPending = member.status === 'Pending' || !member.emailVerified;
                                        // Note: You can adjust this logic if your API returns strict 'Pending' status.

                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">

                                                {/* Name + Role Badge */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 text-blue-700 dark:text-blue-200 font-bold text-sm">
                                                            {(member.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                                            {member.name || 'Invited User'}
                                                            {member.role === 'viewer' && (
                                                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                                    VIEWER
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                        <EnvelopeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                        {member.email}
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isPending ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                                                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></span>
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                                                            Active
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleRemove(member.id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition text-sm flex items-center justify-end w-full"
                                                    >
                                                        <TrashIcon className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" aria-modal="true">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsInviteModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Invite Team Member</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter their email address to send an invitation.</p>

                        <form onSubmit={handleInvite}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="colleague@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {inviteStatus && (
                                <div className={`mb-4 p-3 rounded-md text-sm ${inviteStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {inviteStatus.message}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Sending Invite...' : 'Send Invitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </Layout>
    );
};

export default TeamPage;
