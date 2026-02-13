'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import {
    SparklesIcon,
    ShareIcon,
    ChartBarIcon,
    BookOpenIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';

export default function OnboardingModal({ isOpen, onComplete }) {

    const handleAiHelp = () => {
        // Dispatch event to open AI Chat Assistant
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-ai-chat'));
        }
        onComplete(); // Close the modal
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl font-bold leading-6 text-gray-900 text-center mb-6"
                                >
                                    Welcome to CortexCart! 🚀
                                </Dialog.Title>
                                <div className="mt-2 text-center text-gray-600 mb-8">
                                    <p className="mb-4">
                                        To get the most out of your dashboard, you'll need to connect your accounts.
                                        Without connections, some widgets and data specific to your platforms may not appear.
                                    </p>
                                    <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded-lg inline-block">
                                        Don't worry, you can do this at your own pace!
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Connect Socials */}
                                    <Link href="/settings/social-connections" onClick={onComplete} className="group relative block p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <ShareIcon className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-900">Connect Social Accounts</h4>
                                                <p className="text-sm text-gray-500">Link Facebook, Instagram, TikTok & more.</p>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Connect Analytics */}
                                    <Link href="/settings/integrations" onClick={onComplete} className="group relative block p-6 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                <ChartBarIcon className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-900">Connect Google Analytics</h4>
                                                <p className="text-sm text-gray-500">Fetch traffic & performance data.</p>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* AI Assistant */}
                                    <button onClick={handleAiHelp} className="group relative block p-6 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all w-full text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                <SparklesIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Ask AI for Help</h4>
                                                <p className="text-sm text-gray-500">Let our AI guide you through setup.</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Help Resources */}
                                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                                        <h4 className="font-semibold text-gray-900 mb-2">Need more help?</h4>
                                        <Link href="/support/knowledgebase" onClick={onComplete} className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                            <BookOpenIcon className="h-5 w-5 mr-2" />
                                            Knowledge Base
                                        </Link>
                                        <Link href="/support/help-videos" onClick={onComplete} className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                            <VideoCameraIcon className="h-5 w-5 mr-2" />
                                            Watch Help Videos
                                        </Link>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                                        onClick={onComplete}
                                    >
                                        Skip for Now
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}