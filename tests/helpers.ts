import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

/**
 * A simulated response from a Supabase query.
 */
interface MockQueryResult {
    data: unknown;
    error: null | { message: string };
    count?: number | null;
}

/**
 * Log of a query-builder operation.
 */
type QueryCall = {
    table: string;
    method: string;
    args: unknown[];
};

type MockRow = Record<string, unknown>;

/**
 * Creates a mock Supabase client.
 *
 * Usage:
 *   const { client, mockFrom, whenFrom, setMockTable } = createMockSupabaseClient();
 *
 *   whenFrom('profiles').select({ data: [...], error: null });
 *
 *   setMockTable(name, data)
 */
export function createMockSupabaseClient() {
    // Legacy code, maps a non-persistent table of data to a string
    const tableResponses = new Map<string, MockQueryResult[]>();

    // Persistent table data
    const tableData = new Map<string, MockRow[]>();

    // Query history
    const queryLog: QueryCall[] = [];

    // Helper functions to setup client
    function cloneRows(rows: MockRow[]): MockRow[] {
        return rows.map(row => structuredClone(row));
    }

    function setMockTable(table: string, rows: MockRow[]) {
        tableData.set(table, cloneRows(rows));
    }

    function getRows(table: string): MockRow[] {
        return cloneRows(tableData.get(table) ?? []);
    }

    /**
     * Legacy code
     *
     * Enqueue a simulated response into the client that will be pushed when
     * the from method is called.
     *
     * @param table Name of impersonated table
     * @return A MockQueryResult of specified table.
     */
    function whenFrom(table: string) {
        return {
            select(result: MockQueryResult) {
                const queue = tableResponses.get(table) ?? [];
                queue.push(result);
                tableResponses.set(table, queue);
                return this;
            },
        };
    }

    const mockFrom = vi.fn((table: string) => {
        // queue is used for legacy code
        const queue = tableResponses.get(table) ?? [];
        const scriptedResponse = queue.shift();

        //
        const filters: Array<{
            method: 'eq' | 'in';
            column: string;
            value: unknown;
        }> = [];

        // record performed query instructions
        function record(method: string, args: unknown[]) {
            queryLog.push({ table, method, args });
        }

        const queryState = {
            operation: 'select' as 'select' | 'update',
            updateValues: null as MockRow | null,
            singleMode: null as 'single' | 'maybeSingle' | null,
            limitValue: null as number | null,
            rangeValue: null as [number, number] | null,
            orderValue: null as { column: string; ascending: boolean } | null,
            returningRows: false,
        };

        const builder: Record<string, unknown> = {};

        function matches(row: MockRow): boolean {
            return filters.every(filter => {
                const value = row[filter.column];

                if (filter.method === 'eq') {
                    return value === filter.value;
                }

                if (Array.isArray(filter.value)) {
                    return filter.value.includes(value);
                }

                return false;
            });
        }

        function execute(): MockQueryResult {
            // handle UPDATE queries separately from SELECT queries
            if (queryState.operation === 'update') {
                if (scriptedResponse?.error) {
                    return scriptedResponse;
                }

                const rows = tableData.get(table) ?? [];
                const updatedRows: MockRow[] = [];

                for (const row of rows) {
                    if (matches(row) && queryState.updateValues) {
                        Object.assign(row, structuredClone(queryState.updateValues));
                        updatedRows.push(structuredClone(row));
                    }
                }

                // handles legacy code
                if (scriptedResponse) {
                    return scriptedResponse;
                }

                return {
                    data: queryState.returningRows ? updatedRows : null,
                    error: null,
                };
            }

            // legacy code for non-persistent tables
            if (scriptedResponse) {
                return scriptedResponse;
            }

            let rows = cloneRows(tableData.get(table) ?? []);
            rows = rows.filter(matches);
            const count = rows.length;

            // sort results if specified
            if (queryState.orderValue) {
                const { column, ascending } = queryState.orderValue;
                rows.sort((a, b) => {
                    const left = a[column];
                    const right = b[column];

                    if (left === right) return 0;

                    if (left === null || typeof left === 'undefined') {
                        return ascending ? -1 : 1;
                    }

                    if (right === null || typeof right === 'undefined') {
                        return ascending ? 1 : -1;
                    }

                    let comparison = 0;

                    if (left < right) {
                        comparison = -1;
                    } else if (left > right) {
                        comparison = 1;
                    }

                    return ascending ? comparison : -comparison;
                });
            }

            if (queryState.rangeValue) {
                const [start, end] = queryState.rangeValue;
                rows = rows.slice(start, end + 1);
            }

            if (queryState.limitValue !== null) {
                rows = rows.slice(0, queryState.limitValue);
            }

            if (queryState.singleMode === 'single') {
                if (rows.length !== 1) {
                    return {
                        data: null,
                        error: {
                            message: `Expected exactly one row, received ${rows.length}`,
                        },
                    };
                }

                return { data: rows[0], error: null, count };
            }

            if (queryState.singleMode === 'maybeSingle') {
                if (rows.length > 1) {
                    return {
                        data: null,
                        error: {
                            message: `Expected at most one row, received ${rows.length}`,
                        },
                    };
                }

                return {
                    data: rows[0] ?? null,
                    error: null,
                    count,
                };
            }

            return { data: rows, error: null, count };
        }

        // Mock SQL functions to imitate supabase functionality
        builder.select = vi.fn((...args: unknown[]) => {
            record('select', args);

            if (queryState.operation === 'update') {
                queryState.returningRows = true;
            }

            return builder;
        });

        builder.eq = vi.fn((column: string, value: unknown) => {
            record('eq', [column, value]);
            filters.push({ method: 'eq', column, value });
            return builder;
        });

        builder.in = vi.fn((column: string, values: unknown) => {
            record('in', [column, values]);
            filters.push({ method: 'in', column, value: values });
            return builder;
        });

        builder.update = vi.fn((values: MockRow) => {
            record('update', [values]);
            queryState.operation = 'update';
            queryState.updateValues = values;
            return builder;
        });

        builder.single = vi.fn(() => {
            record('single', []);
            queryState.singleMode = 'single';
            return builder;
        });

        builder.maybeSingle = vi.fn(() => {
            record('maybeSingle', []);
            queryState.singleMode = 'maybeSingle';
            return builder;
        });

        builder.order = vi.fn((column: string, options?: { ascending?: boolean }) => {
            record('order', [column, options]);
            queryState.orderValue = {
                column,
                ascending: options?.ascending ?? true,
            };
            return builder;
        });

        builder.limit = vi.fn((limit: number) => {
            record('limit', [limit]);
            queryState.limitValue = limit;
            return builder;
        });

        builder.range = vi.fn((start: number, end: number) => {
            record('range', [start, end]);
            queryState.rangeValue = [start, end];
            return builder;
        });

        // Make the builder awaitable.
        builder.then = (resolve: (value: MockQueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
            Promise.resolve().then(execute).then(resolve, reject);

        return builder;
    });

    function reset() {
        tableData.clear();
        tableResponses.clear();
        queryLog.length = 0;
        mockFrom.mockClear();
    }

    const client = { from: mockFrom } as unknown as SupabaseClient;

    return {
        client,
        mockFrom,
        whenFrom,
        setMockTable,
        getRows,
        queryLog,
        reset,
    };
}
