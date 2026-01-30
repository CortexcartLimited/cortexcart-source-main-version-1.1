/**
 * Checks if a user has read-only (viewer) access.
 * @param {object} user - The user object from session or DB.
 * @returns {boolean} - True if the user is a viewer.
 */
export const isReadOnly = (user) => {
    if (!user) return false;
    return user.role === 'viewer';
};
