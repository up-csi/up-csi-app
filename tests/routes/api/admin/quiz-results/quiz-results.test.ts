import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { createMockSupabaseClient } from '../../../../helpers';
import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';
import { POST as post } from '../../../../../src/routes/api/admin/quiz-results/[userId]/grade/+server';

vi.mock('$lib/server/supabaseAdmin', () => ({
    getSupabaseAdmin: vi.fn(),
}));

vi.mock('$lib/server/auth', () => ({
    requireRole: vi.fn(),
}));

const TABLE = 'constiquiz-answers';

function makeEvent(userId: string | null, body: unknown, rawBody = false): RequestEvent {
    return {
        params: userId === null ? {} : { userId },
        request: new Request(`http://localhost/api/admin/quiz-results/${userId ?? ''}/grade`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: rawBody ? String(body) : JSON.stringify(body),
        }),
    } as RequestEvent;
}

function makeAnswer() {
    return {
        answer_id: 1,
        user_id: 'u1',
        points: 2,
        is_checked: false,
        question: { point_value: 5 },
    };
}

function setup() {
    const mock = createMockSupabaseClient();

    vi.mocked(getSupabaseAdmin).mockReturnValue(mock.client as unknown as ReturnType<typeof getSupabaseAdmin>);

    return mock;
}

describe('post api/admin/[userId]/grade [ERROR HANDLING]', () => {
    it('returns 400; error: missing user id', async () => {
        const { client } = setup();

        const response = await post(
            makeEvent(null, {
                answer_id: 1,
                points: 2,
            }),
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: 'Missing userId',
        });

        expect(client.from).not.toHaveBeenCalled();
    });

    it('returns 400; error: invalid json', async () => {
        setup();

        const response = await post(makeEvent('u1', '{invalid json', true));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: 'Invalid JSON',
        });
    });

    it('returns 400; error: invalid answer_id', async () => {
        setup();

        const response = await post(
            makeEvent('u1', {
                answer_id: null,
                points: 2,
            }),
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: 'answer_id required',
        });
    });

    it.each([
        ['a string', '10'],
        ['a decimal', 1.5],
        ['a negative number', -1],
        ['null', null],
    ])('returns 400; error: points is %s', async (_description, points) => {
        setup();

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points,
            }),
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: 'points must be a non-negative integer',
        });
    });

    it('returns 500; error: lookupError', async () => {
        const { whenFrom } = setup();

        whenFrom(TABLE).select({
            data: null,
            error: { message: 'lookup failed' },
        });

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 3,
            }),
        );

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            error: 'lookup failed',
        });
    });

    it('returns 404; error: answer not found', async () => {
        const { setMockTable } = setup();

        setMockTable(TABLE, []);

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 3,
            }),
        );

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({
            error: 'Answer not found',
        });
    });

    it('returns 500; error: points exceed item max', async () => {
        const { setMockTable } = setup();

        setMockTable(TABLE, [makeAnswer()]);

        // max points is 5
        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 6,
            }),
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: 'points exceeds question max (5)',
        });
    });

    it('returns 500; error: update error', async () => {
        const { whenFrom } = setup();

        // First query: successful answer lookup.
        whenFrom(TABLE).select({
            data: makeAnswer(),
            error: null,
        });

        // Second query: the UPDATE fails.
        whenFrom(TABLE).select({
            data: null,
            error: { message: 'update failed' },
        });

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 3,
            }),
        );

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            error: 'update failed',
        });
    });

    it('return error: Sum error', async () => {
        const { whenFrom } = setup();

        // First query: successful answer lookup.
        whenFrom(TABLE).select({
            data: makeAnswer(),
            error: null,
        });

        // Second query: successful update.
        whenFrom(TABLE).select({
            data: null,
            error: null,
        });

        // Third query: fetching the user's scores fails.
        whenFrom(TABLE).select({
            data: null,
            error: { message: 'sum query failed' },
        });

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 3,
            }),
        );

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            error: 'sum query failed',
        });
    });
});

describe('post api/admin/[userId]/grade [EXPECTED OUTPUTS]', () => {
    it('grade a score', async () => {
        const { setMockTable, getRows } = setup();

        setMockTable(TABLE, [makeAnswer()]);

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 4,
            }),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            success: true,
            new_total: 4,
        });

        expect(getRows(TABLE)).toContainEqual(
            expect.objectContaining({
                answer_id: 1,
                user_id: 'u1',
                points: 4,
                is_checked: true,
            }),
        );
    });

    it('re-grade a score', async () => {
        const { setMockTable, getRows } = setup();

        setMockTable(TABLE, [
            {
                ...makeAnswer(),
                points: 3,
                is_checked: true,
            },
        ]);

        const response = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 5,
            }),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            success: true,
            new_total: 5,
        });

        expect(getRows(TABLE)).toContainEqual(
            expect.objectContaining({
                answer_id: 1,
                user_id: 'u1',
                points: 5,
                is_checked: true,
            }),
        );
    });

    it('grade multiple scores', async () => {
        const { setMockTable, getRows } = setup();

        setMockTable(TABLE, [
            makeAnswer(),
            {
                answer_id: 2,
                user_id: 'u1',
                points: 2,
                is_checked: false,
                question: { point_value: 5 },
            },
            {
                answer_id: 3,
                user_id: 'u1',
                points: 1,
                is_checked: true,
                question: { point_value: 5 },
            },
        ]);

        // Grade the first answer.
        const response1 = await post(
            makeEvent('u1', {
                answer_id: 1,
                points: 4,
            }),
        );

        expect(response1.status).toBe(200);
        expect(await response1.json()).toEqual({
            success: true,
            new_total: 7,
        });

        // Grade the second answer.
        const response2 = await post(
            makeEvent('u1', {
                answer_id: 2,
                points: 5,
            }),
        );

        expect(response2.status).toBe(200);
        expect(await response2.json()).toEqual({
            success: true,
            new_total: 10,
        });

        // Confirm both answers were updated.
        expect(getRows(TABLE)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    answer_id: 1,
                    points: 4,
                    is_checked: true,
                }),
                expect.objectContaining({
                    answer_id: 2,
                    points: 5,
                    is_checked: true,
                }),
            ]),
        );
    });
});
