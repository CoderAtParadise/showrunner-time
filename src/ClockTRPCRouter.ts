import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { Codec, getCodec } from "@coderatparadise/showrunner-network/codec";
import { IClockManager } from "./IClockManager.js";
import { AdditionalData, CurrentClockState } from "./codec/index.js";
import { BaseClockConfig, ClockLookup, IClockSource } from "./IClockSource.js";
import { SMPTE } from "./SMPTE.js";
import {
    DispatchReturn,
    trpc
} from "@coderatparadise/showrunner-network";
import {
    MessageClockConfig,
    MessageClockCurrent,
    MessageClockData,
    MessageClockList
} from "./ClockMessages.js";

export function getClockRouter(
    manager: (lookup: ClockLookup) => IClockManager | undefined
) {
    const t = trpc;

    const router = t.router({
        cue: t.procedure
            .input(z.string())
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.cue(input as ClockLookup);
            }),
        uncue: t.procedure
            .input(z.string())
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.uncue(input as ClockLookup);
            }),
        play: t.procedure
            .input(z.string())
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.play(input as ClockLookup);
            }),
        pause: t.procedure
            .input(
                z.object({
                    lookup: z.string(),
                    override: z.boolean()
                })
            )
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input.lookup as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.pause(
                    input.lookup as ClockLookup,
                    input.override
                );
            }),
        stop: t.procedure
            .input(
                z.object({
                    lookup: z.string(),
                    override: z.boolean()
                })
            )
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input.lookup as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.stop(
                    input.lookup as ClockLookup,
                    input.override
                );
            }),
        recue: t.procedure
            .input(
                z.object({
                    lookup: z.string(),
                    override: z.boolean()
                })
            )
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input.lookup as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.recue(
                    input.lookup as ClockLookup,
                    input.override
                );
            }),
        setTime: t.procedure
            .input(
                z.object({
                    lookup: z.string(),
                    time: z.string()
                })
            )
            .output(z.boolean())
            .mutation(async ({ input }) => {
                const _manager = manager(input.lookup as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                return await _manager.setTime(
                    input.lookup as ClockLookup,
                    new SMPTE(input.time)
                );
            }),
        data: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            if (!_manager)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find manager`
                });
            const clock = _manager?.request(input as ClockLookup);
            if (!clock)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find a clock with id: ${input}`
                });
            return observable<AdditionalData>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_data") as Codec<IClockSource>
                    ).serialize(clock) as AdditionalData;
                    emit.next(data);
                };
                _manager?.listen(
                    { type: MessageClockData, handler: "event" },
                    onUpdate
                );

                return () => {
                    _manager?.stopListening(
                        { type: MessageClockData, handler: "event" },
                        onUpdate
                    );
                };
            });
        }),
        current: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            if (!_manager)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find manager`
                });
            const clock = _manager.request(input as ClockLookup);
            if (!clock)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find a clock with id: ${input}`
                });
            return observable<CurrentClockState>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_current") as Codec<IClockSource>
                    ).serialize(clock) as CurrentClockState;
                    emit.next(data);
                };
                _manager.listen(
                    { type: MessageClockCurrent, handler: "event" },
                    onUpdate
                );

                return () => {
                    _manager.stopListening(
                        { type: MessageClockCurrent, handler: "event" },
                        onUpdate
                    );
                };
            });
        }),
        config: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            if (!_manager)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find manager`
                });
            const clock = _manager.request(input as ClockLookup);
            if (!clock)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find a clock with id: ${input}`
                });
            return observable<BaseClockConfig & unknown>((emit) => {
                /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                const onUpdate = (dispatch: DispatchReturn) => {
                    if (
                        (dispatch.ret[0] as ClockLookup) &&
                        dispatch.ret[0] === (input as ClockLookup)
                    ) {
                        const data = (
                            getCodec("sync_clock_config") as Codec<IClockSource>
                        ).serialize(clock) as BaseClockConfig & unknown;
                        emit.next(data);
                    }
                };
                /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                _manager.listen(
                    { type: MessageClockConfig, handler: "event" },
                    onUpdate
                );
                return () => {
                    _manager.stopListening(
                        { type: MessageClockConfig, handler: "event" },
                        onUpdate
                    );
                };
            });
        }),
        updateConfig: t.procedure
            .input(z.object({ lookup: z.string() }).passthrough())
            .output(z.void())
            .mutation(({ input }) => {
                const _manager = manager(input.lookup as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                const clock = _manager.request(input.lookup as ClockLookup);
                if (!clock)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find a clock with id: ${input.lookup}`
                    });
                const config = getCodec(
                    "sync_clock_config"
                ) as Codec<IClockSource>;
                config.deserialize(input, clock);
            }),
        list: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            if (!_manager)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find manager`
                });
            return observable<string[]>((emit) => {
                const onUpdate = () => {
                    emit.next(_manager.list());
                };
                _manager.listen(
                    { type: MessageClockList, handler: "event" },
                    onUpdate
                );
                return () => {
                    _manager.stopListening(
                        { type: MessageClockList, handler: "event" },
                        onUpdate
                    );
                };
            });
        }),
        create: t.procedure
            .input(
                z
                    .object({
                        lookup: z.string(),
                        name: z.string(),
                        type: z.string()
                    })
                    .passthrough()
            )
            .mutation(({ input }) => {
                const _manager = manager(input.lookup as ClockLookup);
                if (!_manager)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Failed to find manager`
                    });
                const clock = (
                    getCodec("sync_create_clock") as Codec<IClockSource>
                ).deserialize(input);
                if (!_manager.add(clock))
                    throw new TRPCError({
                        message: `Unable to create clock: ${input.type}:${input.name}`,
                        code: "PARSE_ERROR"
                    });
                void _manager.dispatch(
                    { type: MessageClockList, handler: "event" },
                    _manager.id()
                );
            }),
        remove: t.procedure.input(z.string()).mutation(({ input }) => {
            const _manager = manager(input as ClockLookup);
            if (!_manager)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Failed to find manager`
                });
            if (_manager.remove(input as ClockLookup))
                throw new TRPCError({
                    message: `Unable to delete clock: ${input}`,
                    code: "NOT_FOUND"
                });
            void _manager.dispatch(
                { type: MessageClockList, handler: "event" },
                _manager.id()
            );
        })
    });
    return router;
}
