import {initTRPC, TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { Codec, getCodec } from "@coderatparadise/showrunner-network/codec";
import { ClockManager } from "./ClockManager.js";
import { AdditionalData, CurrentClockState } from "./codec/index.js";
import { BaseClockConfig, ClockLookup, IClockSource } from "./IClockSource.js";
import { SMPTE } from "./SMPTE.js";

export function getClockRouter(manager: (lookup: ClockLookup) => ClockManager) {
    const t = initTRPC()();

    const router = t.router({
        play: t.procedure
            .input(z.string())
            .output(z.boolean())
            .query(async ({ input }) => {
                return await manager(input as ClockLookup).play(
                    input as ClockLookup
                );
            }),
        pause: t.procedure
            .input(z.string())
            .output(z.boolean())
            .query(async ({ input }) => {
                return await manager(input as ClockLookup).pause(
                    input as ClockLookup
                );
            }),
        stop: t.procedure
            .input(z.string())
            .output(z.boolean())
            .query(async ({ input }) => {
                return await manager(input as ClockLookup).stop(
                    input as ClockLookup
                );
            }),
        reset: t.procedure
            .input(
                z.object({
                    lookup: z.string(),
                    override: z.boolean()
                })
            )
            .output(z.boolean())
            .query(async ({ input }) => {
                return await manager(input.lookup as ClockLookup).reset(
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
                return await manager(input.lookup as ClockLookup).setTime(
                    input.lookup as ClockLookup,
                    new SMPTE(input.time)
                );
            }),
        lookup: t.procedure
            .input(z.string())
            .output(
                z.object({
                    service: z.string(),
                    show: z.string(),
                    session: z.string(),
                    id: z.string(),
                    type: z.string()
                })
            )
            .query(({ input }) => {
                const lookup = input as ClockLookup;

                return {
                    service: "unknown",
                    show: "unknown",
                    session: "unknown",
                    id: "unknown",
                    type: "unknown"
                };
            }),
        data: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            const clock = _manager.request(input as ClockLookup);
            return observable<AdditionalData>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_data") as Codec<IClockSource>
                    ).serialize(clock) as AdditionalData;
                    emit.next(data);
                };
                _manager
                    .eventHandler()
                    .on(`sync_clock_data_${clock.identifier().id}`, onUpdate);

                return () => {
                    _manager
                        .eventHandler()
                        .off(
                            `sync_clock_data_${clock.identifier().id}`,
                            onUpdate
                        );
                };
            });
        }),
        current: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            const clock = _manager.request(input as ClockLookup);
            return observable<CurrentClockState>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_current") as Codec<IClockSource>
                    ).serialize(clock) as CurrentClockState;
                    emit.next(data);
                };
                _manager
                    .eventHandler()
                    .on(
                        `sync_clock_current_${clock.identifier().id}`,
                        onUpdate
                    );

                return () => {
                    _manager
                        .eventHandler()
                        .off(
                            `sync_clock_current_${clock.identifier().id}`,
                            onUpdate
                        );
                };
            });
        }),
        config: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            const clock = _manager.request(input as ClockLookup);
            return observable<BaseClockConfig & unknown>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_config") as Codec<IClockSource>
                    ).serialize(clock) as BaseClockConfig & unknown;
                    emit.next(data);
                };
                _manager
                    .eventHandler()
                    .on(`sync_clock_config_${clock.identifier().id}`, onUpdate);
                return () => {
                    _manager
                        .eventHandler()
                        .off(
                            `sync_clock_config_${clock.identifier().id}`,
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
                const clock = _manager.request(input.lookup as ClockLookup);
                const config = getCodec(
                    "sync_clock_config"
                ) as Codec<IClockSource>;
                config.deserialize(input, clock);
                _manager
                    .eventHandler()
                    .emit(`sync_clock_config_${clock.identifier().id}`);
            }),
        list: t.procedure.input(z.string()).subscription(({ input }) => {
            const _manager = manager(input as ClockLookup);
            return observable<string[]>((emit) => {
                const onupdate = () => {
                    emit.next(_manager.list());
                };
                _manager
                    .eventHandler()
                    .on(`sync_clock_list_${_manager.id()}`, onupdate);
                return () => {
                    _manager
                        .eventHandler()
                        .off(`sync_clock_list_${_manager.id()}`, onupdate);
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
            .mutation(({ input, ctx }) => {
                const _manager = manager(input.lookup as ClockLookup);
                const clock = (
                    getCodec("sync_create_clock") as Codec<IClockSource>
                ).deserialize(input);
                if (!_manager.add(clock))
                    throw new TRPCError({
                        message: `Unable to create clock: ${input.type}:${input.name}`,
                        code: "PARSE_ERROR"
                    });
                _manager
                    .eventHandler()
                    .emit(`sync_clock_list_${_manager.id()}`);
            }),
        delete: t.procedure.input(z.string()).mutation(({ input, ctx }) => {
            const _manager = manager(input as ClockLookup);
            if (_manager.remove(input as ClockLookup))
                throw new TRPCError({
                    message: `Unable to delete clock: ${input}`,
                    code: "NOT_FOUND"
                });
            _manager.eventHandler().emit(`sync_clock_list_${_manager.id()}`);
        })
    });
    return router;
}
