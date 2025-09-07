const errorMessages: Record<string, string> = {
    oauth_failed: "We couldn't complete your login with Google",
    domain_restricted: 'Only UP-Mail based accounts are allowed',
    no_user: 'Could not retrieve your account. Please try again.',
    non_csi: 'Invalid login, not affiliated with UP CSI',
    db_error: 'A server error occured while verifying your account. Please try again',
    invalid_callback: 'Invalid login attempt. Please try again.',
    unknown: 'An unknown error occured. Please try again.',
};

export const load = ({ url }) => {
    const code = url.searchParams.get('code') ?? 'unknown';
    const message = errorMessages[code] ?? errorMessages.unknown;
    return { message };
};
