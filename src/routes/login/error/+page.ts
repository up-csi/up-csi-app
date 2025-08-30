const errorMessages: Record<string, string> = {
    oauth_failed: "We couldn't complete your login with Google",
    domain_restricted: 'Only UP-Mail based accounts are allowed',
    no_user: 'Could not retrieve your account. Please try again.',
    non_CSI: 'Invalid login, not affiliated with UP CSI',
    invalid_callback: 'Invalid login attempt. Please try again.',
    unknown: 'An unknown error occured. Please try again.',
};

export const load = ({ url }) => {
    const code = url.searchParams.get('code') ?? 'unknown';
    const message = errorMessages[code] ?? errorMessages.unknown;
    return { message };
};
