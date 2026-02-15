import React from 'react';

export const PinterestIcon = (props) => (
    <svg {...props} fill="#E60023" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.14 2.686 7.66 6.357 8.94.02-.19.03-.4.05-.61l.33-1.4a.12.12 0 0 1 .1-.1c.36-.18 1.15-.56 1.15-.56s-.3-.91-.25-1.79c.06-.9.65-2.12 1.46-2.12.68 0 1.2.51 1.2 1.12 0 .68-.43 1.7-.65 2.64-.18.78.38 1.42.92 1.42 1.58 0 2.63-2.1 2.63-4.22 0-1.8-.95-3.26-2.7-3.26-2.12 0-3.32 1.58-3.32 3.16 0 .6.22 1.25.5 1.62.03.04.04.05.02.13l-.15.65c-.05.2-.14.24-.32.08-1.05-.9-1.5-2.3-1.5-3.82 0-2.78 2.04-5.38 5.8-5.38 3.1 0 5.2 2.25 5.2 4.67 0 3.1-1.95 5.42-4.62 5.42-.9 0-1.75-.46-2.05-1l-.52 2.1c-.24 1-.92 2.25-.92 2.25s-.28.1-.32.08c-.46-.38-.68-1.2-.55-1.88l.38-1.68c.12-.55-.03-1.2-.5-1.52-1.32-.9-1.9-2.6-1.9-4.22 0-2.28 1.6-4.3 4.6-4.3 2.5 0 4.2 1.8 4.2 4.15 0 2.5-1.55 4.5-3.8 4.5-.75 0-1.45-.38-1.7-.82l-.28-.9c-.1-.4-.2-.8-.2-1.22 0-.9.42-1.68 1.12-1.68.9 0 1.5.8 1.5 1.88 0 .8-.25 1.88-.58 2.8-.25.7-.5 1.4-.5 1.4s-.3.12-.35.1c-.2-.1-.3-.2-.3-.4l.02-1.12z" /></svg>
);

export const TikTokIcon = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
);

export const YouTubeIcon = (props) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
);

export const PLATFORMS = {
    x: {
        name: 'X (twitter)',
        maxLength: 280,
        icon: (props) => (<svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M13.682 10.623 20.239 3h-1.64l-5.705 6.44L7.65 3H3l6.836 9.753L3 21h1.64l6.082-6.885L16.351 21H21l-7.318-10.377zM14.78 13.968l-.87-1.242L6.155 4.16h2.443l4.733 6.742.87 1.242 7.03 9.98h-2.443l-5.045-7.143z" /></svg>),
        placeholder: "What is on your mind? or need help ask AI to help you generate your feelings into more engaging content including relevant tags",
        disabled: false,
        color: '#000000',
        apiEndpoint: '/api/social/post'
    },
    facebook: {
        name: 'Facebook',
        maxLength: 5000,
        icon: (props) => (<svg {...props} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.77-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>),
        placeholder: "What is on your mind? or need help ask AI to help you generate your feelings into more engaging content including relevant tags",
        disabled: false,
        color: '#1877F2',
        apiEndpoint: '/api/social/post'
    },
    pinterest: {
        name: 'Pinterest',
        maxLength: 500,
        icon: PinterestIcon,
        placeholder: 'Add a Pin description or Generate with AI including pin tags...',
        disabled: false,
        color: '#E60023',
        apiEndpoint: '/api/social/post',
    },
    instagram: {
        name: 'Instagram',
        maxLength: 2200,
        icon: (props) => (<svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.74 0 2.28.01 3.07.05 1.07.05 1.81.22 2.42.46a4.88 4.88 0 0 1 1.76 1.15 4.88 4.88 0 0 1 1.15 1.76c.24.6.41 1.35.46 2.42.04.79.05 1.33.05 3.07s-.01 2.28-.05 3.07c-.05 1.07-.22 1.81-.46 2.42a4.88 4.88 0 0 1-1.15 1.76 4.88 4.88 0 0 1-1.76 1.15c-.6.24-1.35.41-2.42.46-.79.04-1.33.05-3.07.05s-2.28-.01-3.07-.05c-1.07-.05-1.81-.22-2.42-.46a4.88 4.88 0 0 1-1.76-1.15 4.88 4.88 0 0 1-1.15-1.76c-.24-.6-.41-1.35-.46-2.42a83.3 83.3 0 0 1-.05-3.07s.01-2.28.05-3.07c.05-1.07.22 1.81.46-2.42a4.88 4.88 0 0 1 1.15-1.76A4.88 4.88 0 0 1 6.5 2.51c.6-.24 1.35-.41 2.42-.46.79-.04 1.33-.05 3.07-.05M12 0C9.26 0 8.74.01 7.9.06 6.63.11 5.6.31 4.7.7a6.88 6.88 0 0 0-2.47 2.47c-.4 1-.6 1.93-.65 3.2-.04.84-.05 1.36-.05 4.1s.01 3.26.05 4.1c.05 1.27.25 2.2.65 3.2a6.88 6.88 0 0 0 2.47 2.47c1 .4 1.93.6 3.2.65.84.04 1.36.05 4.1.05s3.26-.01 4.1-.05c1.27-.05 2.2-.25 3.2-.65a6.88 6.88 0 0 0 2.47-2.47c.4-1 .6-1.93.65-3.2.04-.84.05-1.36-.05-4.1s-.01-3.26-.05-4.1c-.05-1.27-.25-2.2-.65-3.2A6.88 6.88 0 0 0 19.3.7c-1-.4-1.93-.6-3.2-.65-.84-.04-1.36-.05-4.1-.05zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /></svg>),
        placeholder: 'Add a Image description or Generate with AI including tags...',
        disabled: false,
        color: '#E4405F',
        apiEndpoint: '/api/social/post'
    },
    youtube: {
        name: 'YouTube',
        maxLength: Infinity,
        icon: YouTubeIcon,
        placeholder: "Enter a video description or generate with AI including video tags...",
        disabled: false,
        color: '#FF0000',
        apiEndpoint: '/api/social/youtube/upload-video'
    },
    tiktok: {
        name: 'TikTok',
        maxLength: 2200,
        icon: TikTokIcon,
        placeholder: "Describe your video... #fyp",
        disabled: false,
        color: '#000000',
        apiEndpoint: '/api/social/tiktok/post'
    }
};
