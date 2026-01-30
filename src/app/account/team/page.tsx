'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout';
import { useSession } from 'next-auth/react';
import { TrashIcon, UserPlusIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const TeamPage = () => {
    const { data: session } = useSession();
    const [members, setMembers] = useState([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteStatus, setInviteStatus] = useState(null); // { type: 'success' | 'error', message: '' }

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
            } else {
                setInviteStatus({ type: 'error', message: data.error || 'Failed to send invite.' });
            }
        } catch (err) {
            setInviteStatus({ type: 'error', message: 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;

        try {
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
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Team</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Invite colleagues to view your dashboard. Team members have <strong>Read-Only</strong> access and cannot make changes.
                </p>

                {/* Invite Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <UserPlusIcon className="h-6 w-6 text-blue-500 mr-2" />
                        Invite New Member
                    </h2>
                    <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </form>
                    {inviteStatus && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${inviteStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {inviteStatus.message}
                        </div>
                    )}
                </div>

                {/* Members List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Members ({members.length})</h2>
                    </div>

                    {members.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No team members yet. Invite someone above!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name / Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {members.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {member.name || 'Pending...'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {member.role || 'viewer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {member.status === 'Active' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleRemove(member.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition"
                                                    title="Remove User"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TeamPage;
