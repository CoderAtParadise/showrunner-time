import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { Codec, getCodec } from "@coderatparadise/showrunner-network/codec";
import { ClockManager } from "./ClockManager.js";
import { AdditionalData, CurrentClockState } from "./codec/index.js";
import { BaseClockConfig, IClockSource } from "./IClockSource.js";

export function getClockRouter(
    context: ({
        req,
        res
    }: CreateHTTPContextOptions | CreateWSSContextFnOptions) => {
        manager: ClockManager | undefined;
        id: string;
    }
) {
    type Context = inferAsyncReturnType<typeof context>;
    const t = initTRPC<{ ctx: Context }>()();

    const getManager = t.middleware(({ next, ctx }) => {
        if (!ctx.manager)
            throw new TRPCError({
                message: `Unable to find clock manager: ${ctx.id}`,
                code: "NOT_FOUND"
            });
        return next({
            ctx: {
                manager: ctx.manager
            }
        });
    });
    const hasManager = t.procedure.use(getManager);
    const router = t.router({
        play: hasManager
            .input(z.string())
            .output(z.void())
            .query(({ input, ctx }) => {
                if (!ctx.manager.play(input))
                    throw new TRPCError({
                        message: `Unable to play clock: ${input}`,
                        code: "NOT_FOUND"
                    });
            }),
        pause: hasManager
            .input(z.string())
            .output(z.void())
            .query(({ input, ctx }) => {
                if (!ctx.manager.pause(input))
                    throw new TRPCError({
                        message: `Unable to pause clock: ${input}`,
                        code: "NOT_FOUND"
                    });
            }),
        stop: hasManager
            .input(z.string())
            .output(z.void())
            .query(({ input, ctx }) => {
                if (!ctx.manager.stop(input))
                    throw new TRPCError({
                        message: `Unable to stop clock: ${input}`,
                        code: "NOT_FOUND"
                    });
            }),
        reset: hasManager
            .input(z.string())
            .output(z.void())
            .query(({ input, ctx }) => {
                if (!ctx.manager.reset(input))
                    throw new TRPCError({
                        message: `Unable to reset clock: ${input}`,
                        code: "NOT_FOUND"
                    });
            }),
        setTime: hasManager
            .input(
                z.object({
                    id: z.string(),
                    time: z.string()
                })
            )
            .output(z.void())
            .mutation(({ input, ctx }) => {
                if (!ctx.manager.setTime(input.id, input.time))
                    throw new TRPCError({
                        message: `Unable to set time for clock: ${input.id}`,
                        code: "NOT_FOUND"
                    });
            }),
        data: hasManager.input(z.string()).subscription(({ input, ctx }) => {
            const clock = ctx.manager.request(input);
            return observable<AdditionalData>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_data") as Codec<IClockSource>
                    ).serialize(clock) as AdditionalData;
                    emit.next(data);
                };
                ctx.manager
                    .eventHandler()
                    .on(`sync_clock_data_${clock.identifier().id}`, onUpdate);

                return () => {
                    ctx.manager
                        .eventHandler()
                        .off(
                            `sync_clock_data_${clock.identifier().id}`,
                            onUpdate
                        );
                };
            });
        }),
        current: hasManager.input(z.string()).subscription(({ input, ctx }) => {
            const clock = ctx.manager.request(input);
            return observable<CurrentClockState>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_current") as Codec<IClockSource>
                    ).serialize(clock) as CurrentClockState;
                    emit.next(data);
                };
                ctx.manager
                    .eventHandler()
                    .on(
                        `sync_clock_current_${clock.identifier().id}`,
                        onUpdate
                    );

                return () => {
                    ctx.manager
                        .eventHandler()
                        .off(
                            `sync_clock_current_${clock.identifier().id}`,
                            onUpdate
                        );
                };
            });
        }),
        config: hasManager.input(z.string()).subscription(({ input, ctx }) => {
            const clock = ctx.manager.request(input);
            return observable<BaseClockConfig & unknown>((emit) => {
                const onUpdate = () => {
                    const data = (
                        getCodec("sync_clock_config") as Codec<IClockSource>
                    ).serialize(clock) as BaseClockConfig & unknown;
                    emit.next(data);
                };
                ctx.manager
                    .eventHandler()
                    .on(`sync_clock_config_${clock.identifier().id}`, onUpdate);
                return () => {
                    ctx.manager
                        .eventHandler()
                        .off(
                            `sync_clock_config_${clock.identifier().id}`,
                            onUpdate
                        );
                };
            });
        }),
        updateConfig: hasManager
            .input(z.object({ id: z.string() }).passthrough())
            .output(z.void())
            .mutation(({ input, ctx }) => {
                const clock = ctx.manager.request(input.id);
                const config = getCodec(
                    "sync_clock_config"
                ) as Codec<IClockSource>;
                config.deserialize(input, clock);
                ctx.manager
                    .eventHandler()
                    .emit(`sync_clock_config_${input.id}`);
            }),
        list: hasManager.input(z.void()).subscription(({ ctx }) => {
            return observable<string[]>((emit) => {
                const onupdate = () => {
                    emit.next(ctx.manager.list());
                };
                ctx.manager
                    .eventHandler()
                    .on(`sync_clock_list_${ctx.manager.id()}`, onupdate);
                return () => {
                    ctx.manager
                        .eventHandler()
                        .off(`sync_clock_list_${ctx.manager.id()}`, onupdate);
                };
            });
        }),
        create: hasManager
            .input(
                z
                    .object({
                        name: z.string(),
                        type: z.string()
                    })
                    .passthrough()
            )
            .mutation(({ input, ctx }) => {
                const clock = (
                    getCodec("sync_create_clock") as Codec<IClockSource>
                ).deserialize(input);
                if (!ctx.manager.add(clock))
                    throw new TRPCError({
                        message: `Unable to create clock: ${input.type}:${input.name}`,
                        code: "PARSE_ERROR"
                    });
                ctx.manager
                    .eventHandler()
                    .emit(`sync_clock_list_${ctx.manager.id()}`);
            }),
        delete: hasManager.input(z.string()).mutation(({ input, ctx }) => {
            if (ctx.manager.remove(input))
                throw new TRPCError({
                    message: `Unable to delete clock: ${input}`,
                    code: "NOT_FOUND"
                });
            ctx.manager
                .eventHandler()
                .emit(`sync_clock_list_${ctx.manager.id()}`);
        })
    });
    return router;
}
